import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    MODELS_DIR: Path = BASE_DIR / "models"
    MEMORY_DIR: Path = BASE_DIR / "memory_db"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/history.db"

    # API Keys
    TAVILY_API_KEY: Optional[str] = None

    # Inference defaults
    DEFAULT_N_CTX: int = 4096
    DEFAULT_N_GPU_LAYERS: int = -1  # -1 = all layers to GPU
    DEFAULT_N_THREADS: int = os.cpu_count() or 4
    DEFAULT_TEMPERATURE: float = 0.7
    DEFAULT_TOP_P: float = 0.9

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",  # Ignores unknown variables instead of crashing
    )

settings = Settings()

# Ensure directories exist
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.MEMORY_DIR.mkdir(parents=True, exist_ok=True)