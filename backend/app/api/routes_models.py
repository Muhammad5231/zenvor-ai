from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.model_engine import model_engine
from app.core.config import settings

router = APIRouter(prefix="/api/models", tags=["Models"])

class LoadModelRequest(BaseModel):
    filename: str
    n_ctx: Optional[int] = settings.DEFAULT_N_CTX
    n_gpu_layers: Optional[int] = settings.DEFAULT_N_GPU_LAYERS

@router.get("")
def list_models():
    return {
        "models": model_engine.list_available_models(),
        "active_model": model_engine.active_model_name,
        "params": model_engine.model_params
    }

@router.post("/load")
def load_model(req: LoadModelRequest):
    try:
        model_engine.load_model(
            model_filename=req.filename,
            n_ctx=req.n_ctx,
            n_gpu_layers=req.n_gpu_layers
        )
        return {
            "status": "success",
            "message": f"Model {req.filename} loaded successfully",
            "active_model": req.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))