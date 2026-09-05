from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.core.config import settings
from app.services.model_engine import model_engine
from app.api.routes_models import router as models_router
from app.api.routes_history import router as history_router
from app.api.routes_chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    available = model_engine.list_available_models()
    if available:
        first_model = available[0]["filename"]
        print(f"[Startup] Found model {first_model}. Auto-loading...")
        try:
            model_engine.load_model(first_model)
        except Exception as e:
            print(f"[Startup] Auto-load failed: {e}")
    else:
        print(f"[Startup] No GGUF models located in {settings.MODELS_DIR}. Place .gguf files there.")
    yield


app = FastAPI(
    title="Local GGUF Nexus Server",
    description="High-performance backend for GGUF model execution, memory recall, and live search.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router)
app.include_router(history_router)
app.include_router(chat_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "active_model": model_engine.active_model_name}