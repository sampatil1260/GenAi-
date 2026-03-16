"""
Meeting upload endpoint.
Accepts audio (.wav, .mp3, etc.) or video (.mp4, .mkv, .mov, .avi) files,
saves them, then kicks off the full processing pipeline:
  video → audio extraction → transcription → summarization → task extraction → embedding.
"""

import os
import uuid
import json
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.meeting import Meeting, ActionItem
from app.schemas.meeting import MeetingResponse
from app.services.transcription import TranscriptionService
from app.services.summarization import SummarizationService
from app.services.task_extraction import TaskExtractionService

router = APIRouter()
settings = get_settings()

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".mp4", ".mkv", ".mov", ".avi"}


@router.post("/upload", response_model=MeetingResponse)
async def upload_meeting(
    request: Request,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an audio or video file and process it through the full AI pipeline.

    Steps:
      1. Validate file type and size
      2. Save file to disk
      3. Extract audio (if video) and transcribe with Whisper
      4. Summarize with LLM
      5. Extract action items with LLM
      6. Generate embeddings and store in FAISS
      7. Persist everything to PostgreSQL
    """
    # ── 1. Validate file extension ───────────────────────────────
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # ── 2. Save file ────────────────────────────────────────────
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")

    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({file_size_mb:.1f} MB). Max: {settings.MAX_FILE_SIZE_MB} MB",
        )

    with open(file_path, "wb") as f:
        f.write(content)

    # ── 3. Create meeting record ─────────────────────────────────
    meeting = Meeting(title=title, audio_file_path=file_path, status="transcribing")
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    try:
        # ── 4. Transcribe ────────────────────────────────────────
        transcription_service = TranscriptionService()
        transcript_result = transcription_service.transcribe(file_path)

        meeting.transcript = transcript_result["text"]
        meeting.duration_seconds = transcript_result.get("duration", 0.0)
        meeting.status = "summarizing"
        db.commit()

        # ── 5. Summarize ─────────────────────────────────────────
        summarization_service = SummarizationService()
        summary_result = summarization_service.summarize(transcript_result["text"])

        meeting.summary = summary_result.get("summary", "")
        meeting.topic = summary_result.get("topic", "")
        meeting.key_points = json.dumps(summary_result.get("key_points", []))
        meeting.decisions = json.dumps(summary_result.get("decisions", []))
        meeting.highlights = json.dumps(summary_result.get("highlights", []))
        db.commit()

        # ── 6. Extract action items ──────────────────────────────
        task_service = TaskExtractionService()
        tasks = task_service.extract_tasks(transcript_result["text"])

        for task in tasks:
            action_item = ActionItem(
                meeting_id=meeting.id,
                assignee=task["assignee"],
                task=task["task"],
                priority=task.get("priority", "medium"),
            )
            db.add(action_item)
        db.commit()

        # ── 7. Generate embeddings ───────────────────────────────
        embedding_service = request.app.state.embedding_service
        embedding_service.add_meeting(
            meeting_id=str(meeting.id),
            meeting_title=meeting.title,
            text=transcript_result["text"],
        )

        meeting.status = "completed"
        meeting.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(meeting)

    except Exception as e:
        meeting.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    return meeting