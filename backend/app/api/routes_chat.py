import json
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionModel, MessageModel
from app.services.model_engine import model_engine
from starlette.concurrency import run_in_threadpool
from app.services.memory_engine import memory_engine
from app.services.deep_search_engine import deep_search_engine
from app.api.routes_history import generate_title_background

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class StreamChatRequest(BaseModel):
    session_id: str
    message: str
    enable_search: bool = False
    enable_memory: bool = True
    temperature: float = 0.7
    top_p: float = 0.9

@router.post("/stream")
async def chat_stream(
    req: StreamChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    is_first_message = False

    if not session:
        session = SessionModel(id=req.session_id, title="New Chat")
        db.add(session)
        db.commit()
        is_first_message = True
    else:
        existing_count = db.query(MessageModel).filter(MessageModel.session_id == req.session_id).count()
        if existing_count == 0:
            is_first_message = True

    # Persist User Prompt
    user_msg = MessageModel(
        session_id=req.session_id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    session.updated_at = datetime.utcnow()
    db.commit()

    if is_first_message:
        background_tasks.add_task(generate_title_background, req.session_id, req.message)

    async def event_generator():
        yield f"data: {json.dumps({'type': 'status', 'content': 'Analyzing query...'})}\n\n"
        await asyncio.sleep(0.01)

        search_sources = []
        search_context_text = ""
        reasoning_steps = []

        # ----------------------------------------------------
        # DEEP RESEARCH & SEARCH GROUNDING PIPELINE
        # ----------------------------------------------------
        if req.enable_search:
            handle = deep_search_engine.extract_youtube_handle(req.message)
            if handle:
                yield f"data: {json.dumps({'type': 'status', 'content': f'Fetching live channel @{handle} via yt-dlp...'})}\n\n"
                yt_channel = await run_in_threadpool(deep_search_engine.fetch_youtube_channel_ytdlp, handle)
                if yt_channel:
                    search_sources.append(yt_channel)
            
            cleaned_query = deep_search_engine.clean_search_query(req.message)
            yield f"data: {json.dumps({'type': 'status', 'content': f'Searching web...'})}\n\n"
            
            raw_sources = await run_in_threadpool(deep_search_engine.search_web, cleaned_query, 4)
            if raw_sources:
                scraped = await deep_search_engine.execute_crawl(raw_sources)
                search_sources.extend(scraped)

            # Send Verified Sources to UI
            if search_sources:
                yield f"data: {json.dumps({'type': 'sources', 'content': search_sources})}\n\n"
                for src in search_sources:
                    step_log = f"• Read and verified: {src['title'][:50]}..."
                    reasoning_steps.append(step_log)
                    yield f"data: {json.dumps({'type': 'thinking', 'content': step_log + chr(10)})}\n\n"

                context_blocks = []
                for i, src in enumerate(search_sources, start=1):
                    context_blocks.append(
                        f"[[Source {i}]]: {src['title']}\nURL: {src['url']}\nVerified Content:\n{src['content']}\n"
                    )
                search_context_text = "\n".join(context_blocks)
            else:
                yield f"data: {json.dumps({'type': 'thinking', 'content': '• No live web results found.' + chr(10)})}\n\n"

        # ----------------------------------------------------
        # VECTOR MEMORY RETRIEVAL
        # ----------------------------------------------------
        memory_context_text = ""
        if req.enable_memory:
            recalled_docs = await run_in_threadpool(memory_engine.recall_context, req.message, req.session_id, 3)
            if recalled_docs:
                memory_context_text = "\n".join([f"- {doc}" for doc in recalled_docs])
                mem_log = f"• Recalled {len(recalled_docs)} relevant context points from long-term memory."
                reasoning_steps.append(mem_log)
                yield f"data: {json.dumps({'type': 'thinking', 'content': mem_log + chr(10)})}\n\n"

        # System instructions that suppress pretraining refusal biases
        system_prompt = (
            "You are ZENVOR AI, an advanced intelligence assistant running with live web access.\n"
            "CRITICAL INSTRUCTIONS:\n"
            "- NEVER say 'I cannot browse the internet' or 'I do not have access to specific user history'.\n"
            "- You have real-time access to the search results provided below.\n"
            "- Use the provided live web sources to answer directly, accurately, and with structured markdown.\n"
            "- If live sources describe a YouTube channel, creator, or topic, summarize their content, playlists, and focus.\n"
            "- If no data is found, state what was searched and note that limited public records were returned."
        )

        if memory_context_text:
            system_prompt += f"\n\n[USER RECALLED MEMORY]:\n{memory_context_text}"
        if search_context_text:
            system_prompt += f"\n\n[LIVE SEARCH GROUNDING]:\n{search_context_text}"
        else:
            system_prompt += "\n\n[LIVE SEARCH GROUNDING]:\nNo external web results returned for this specific term."

        history_msgs = (
            db.query(MessageModel)
            .filter(MessageModel.session_id == req.session_id)
            .order_by(MessageModel.created_at.asc())
            .all()
        )

        formatted_messages = [{"role": "system", "content": system_prompt}]
        for m in history_msgs[-6:]:
            formatted_messages.append({"role": m.role, "content": m.content})

        yield f"data: {json.dumps({'type': 'status', 'content': 'Synthesizing verified answer...'})}\n\n"
        yield f"data: {json.dumps({'type': 'thinking', 'content': chr(10) + '• Synthesizing final response with citations...' + chr(10)})}\n\n"

        full_thinking = reasoning_steps.copy()
        full_response = []
        in_think_block = False

        try:
            for token in model_engine.stream_chat(
                messages=formatted_messages,
                temperature=req.temperature,
                top_p=req.top_p
            ):
                if "<think>" in token:
                    in_think_block = True
                    token = token.replace("<think>", "")
                if "</think>" in token:
                    in_think_block = False
                    token = token.replace("</think>", "")

                if in_think_block:
                    full_thinking.append(token)
                    yield f"data: {json.dumps({'type': 'thinking', 'content': token})}\n\n"
                else:
                    full_response.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as err:
            yield f"data: {json.dumps({'type': 'error', 'content': str(err)})}\n\n"
            return

        complete_text = "".join(full_response)
        complete_thinking = "\n".join(full_thinking) if full_thinking else None

        # Save assistant message
        assistant_record = MessageModel(
            session_id=req.session_id,
            role="assistant",
            content=complete_text,
            thinking=complete_thinking,
            sources=json.dumps(search_sources) if search_sources else None
        )
        db.add(assistant_record)
        db.commit()

        if req.enable_memory:
            memory_engine.store_interaction(req.session_id, req.message, "user")
            memory_engine.store_interaction(req.session_id, complete_text, "assistant")

        yield f"data: {json.dumps({'type': 'done', 'content': '[DONE]'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")