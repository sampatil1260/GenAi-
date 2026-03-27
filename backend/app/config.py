"""
Application configuration loaded from environment variables.
Uses pydantic-settings for validation and type safety.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "AI Meeting Intelligence"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/meetings_db"

    # ── JWT Auth ─────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "ami-super-secret-key-change-in-production"

    # ── LLM Provider (OpenAI or Google Gemini) ───────────────────
    LLM_PROVIDER: str = "openai"  # "openai" or "gemini"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # ── Whisper ──────────────────────────────────────────────────
    WHISPER_MODEL_SIZE: str = "base"  # tiny, base, small, medium, large

    # ── Embeddings ───────────────────────────────────────────────
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "data/faiss_index"

    # ── File Storage ─────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 100

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton — loaded once, reused everywhere."""
    return Settings()