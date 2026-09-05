from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db, SessionModel, MessageModel
from app.services.model_engine import model_engine

router = APIRouter(prefix="/api/history", tags=["History"])

class SessionCreate(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "New Chat"

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class BatchDeleteRequest(BaseModel):
    session_ids: List[str]

@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    # Only return sessions that have at least one message or are explicitly pinned
    sessions = (
        db.query(SessionModel)
        .outerjoin(MessageModel)
        .group_by(SessionModel.id)
        .order_by(SessionModel.is_pinned.desc(), SessionModel.updated_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "is_pinned": bool(s.is_pinned),
            "created_at": s.created_at.isoformat(),
            "updated_at": s.updated_at.isoformat(),
        }
        for s in sessions
        if len(s.messages) > 0 or s.is_pinned
    ]

@router.post("/sessions")
def create_session(body: SessionCreate, db: Session = Depends(get_db)):
    # Idempotent: If session ID already exists, return it
    if body.id:
        existing = db.query(SessionModel).filter(SessionModel.id == body.id).first()
        if existing:
            return {"id": existing.id, "title": existing.title, "is_pinned": existing.is_pinned}

    new_session = SessionModel(id=body.id if body.id else None, title=body.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {
        "id": new_session.id,
        "title": new_session.title,
        "is_pinned": new_session.is_pinned
    }

@router.patch("/sessions/{session_id}")
def update_session(session_id: str, body: SessionUpdate, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if body.title is not None:
        session.title = body.title.strip()
    if body.is_pinned is not None:
        session.is_pinned = body.is_pinned
    db.commit()
    return {"status": "success", "id": session.id, "title": session.title, "is_pinned": session.is_pinned}

@router.delete("/sessions/{session_id}")
def delete_single_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"status": "deleted", "id": session_id}

@router.post("/sessions/batch-delete")
def batch_delete_sessions(body: BatchDeleteRequest, db: Session = Depends(get_db)):
    db.query(SessionModel).filter(SessionModel.id.in_(body.session_ids)).delete(synchronize_session=False)
    db.commit()
    return {"status": "batch_deleted", "count": len(body.session_ids)}

@router.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(MessageModel)
        .filter(MessageModel.session_id == session_id)
        .order_by(MessageModel.created_at.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "thinking": m.thinking,
            "sources": m.sources,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]

def generate_title_background(session_id: str, prompt: str):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session or (session.title != "New Chat" and session.title != "Untitled"):
            return
        title_prompt = [
            {"role": "system", "content": "Generate a precise 3 to 5 word title summarizing the user's intent. Do not include any reasoning, thinking process, quotes, or punctuation. Return ONLY the title text."},
            {"role": "user", "content": f"Summarize this query into a 3-5 word title: {prompt[:250]}"}
        ]
        generated_title = ""
        for token in model_engine.stream_chat(title_prompt, temperature=0.3, max_tokens=32):
            generated_title += token
            
        # Strip out DeepSeek <think> tags if present
        if "</think>" in generated_title:
            generated_title = generated_title.split("</think>")[-1]
        generated_title = generated_title.replace("<think>", "").strip()
        
        clean_title = generated_title.strip().replace('"', '').replace("'", "")
        if clean_title:
            session.title = clean_title[:42]
            db.commit()
    except Exception as e:
        print(f"[AutoTitle] Error: {e}")
    finally:
        db.close()