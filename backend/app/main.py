"""
FastAPI application — entry point.
Initializes the database, mounts routes, and configures CORS + lifespan.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.api.routes import upload, meetings, search, auth
from app.services.embeddings import EmbeddingService

# Ensure all models are imported so Base.metadata.create_all picks them up
from app.models.user import User          # noqa
from app.models.meeting import Meeting    # noqa

# ── Structured Logging ──────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — create tables, load FAISS index."""
    # ── Startup ──────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH) or "data", exist_ok=True)

    # Pre-load embedding model & FAISS index
    embedding_service = EmbeddingService()
    app.state.embedding_service = embedding_service

    yield

    # ── Shutdown ─────────────────────────────────────────────────
    embedding_service.save_index()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered meeting assistant with transcription, "
                "summarization, task extraction, and semantic search.",
    lifespan=lifespan,
)

# ── CORS — allow React frontend ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register API routers ────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/v1", tags=["Auth"])
app.include_router(upload.router,   prefix="/api/v1", tags=["Upload"])
app.include_router(meetings.router, prefix="/api/v1", tags=["Meetings"])
app.include_router(search.router,   prefix="/api/v1", tags=["Search"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}