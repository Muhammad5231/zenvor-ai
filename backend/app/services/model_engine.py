import os
import threading
from pathlib import Path
from typing import Generator, List, Optional, Dict, Any
from llama_cpp import Llama
from app.core.config import settings

class ModelEngine:
    def __init__(self):
        self.active_model: Optional[Llama] = None
        self.active_model_name: Optional[str] = None
        self.model_params: Dict[str, Any] = {}
        self._lock = threading.Lock()

    def list_available_models(self) -> List[Dict[str, Any]]:
        models_dir = Path(settings.MODELS_DIR).resolve()
        models = []

        if not models_dir.exists():
            return []

        # Scan folder for all .gguf files regardless of extension case
        for file_path in models_dir.iterdir():
            if file_path.is_file() and file_path.suffix.lower() == ".gguf":
                size_gb = round(file_path.stat().st_size / (1024 ** 3), 2)
                models.append({
                    "filename": file_path.name,
                    "path": str(file_path),
                    "size_gb": f"{size_gb} GB",
                    "is_active": file_path.name == self.active_model_name
                })
        return models

    def load_model(
        self,
        model_filename: str,
        n_ctx: int = settings.DEFAULT_N_CTX,
        n_gpu_layers: int = settings.DEFAULT_N_GPU_LAYERS,
        n_threads: int = settings.DEFAULT_N_THREADS
    ):
        with self._lock:
            model_path = Path(settings.MODELS_DIR).resolve() / model_filename
            if not model_path.exists():
                raise FileNotFoundError(f"Model file '{model_filename}' not found at {model_path}")

            if self.active_model is not None:
                del self.active_model
                self.active_model = None

            print(f"[ModelEngine] Loading {model_filename} (Layers: {n_gpu_layers}, Context: {n_ctx})...")
            
            try:
                # Attempt GPU / requested configuration
                self.active_model = Llama(
                    model_path=str(model_path),
                    n_ctx=n_ctx,
                    n_gpu_layers=n_gpu_layers,
                    n_threads=n_threads,
                    verbose=False
                )
            except Exception as e:
                print(f"[ModelEngine] GPU load failed ({e}). Falling back to CPU mode (n_gpu_layers=0)...")
                # Fallback to CPU execution
                self.active_model = Llama(
                    model_path=str(model_path),
                    n_ctx=n_ctx,
                    n_gpu_layers=0,
                    n_threads=n_threads,
                    verbose=False
                )
                n_gpu_layers = 0

            self.active_model_name = model_filename
            self.model_params = {
                "n_ctx": n_ctx,
                "n_gpu_layers": n_gpu_layers,
                "n_threads": n_threads
            }
            print(f"[ModelEngine] Successfully loaded {model_filename}")

    def stream_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = settings.DEFAULT_TEMPERATURE,
        top_p: float = settings.DEFAULT_TOP_P,
        max_tokens: int = 2048
    ) -> Generator[str, None, None]:
        if self.active_model is None:
            raise RuntimeError("No model is currently loaded. Please select a model first.")

        with self._lock:
            response = self.active_model.create_chat_completion(
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                stream=True
            )
            for chunk in response:
                delta = chunk["choices"][0].get("delta", {})
                if "content" in delta and delta["content"]:
                    yield delta["content"]

model_engine = ModelEngine()