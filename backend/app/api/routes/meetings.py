"""
Meeting CRUD endpoints — list, get, and delete meetings.
All endpoints require authentication and scope data to the current user.
"""

import json
import os
import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meeting import MeetingResponse, MeetingSummaryResponse
from app.api.auth_deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/meetings", response_model=list[MeetingResponse])
def list_meetings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List meetings belonging to the current user."""
    query = db.query(Meeting).filter(
        Meeting.user_id == current_user.id
    ).order_by(Meeting.created_at.desc())

    if status:
        query = query.filter(Meeting.status == status)
    meetings = query.offset(skip).limit(limit).all()
    return meetings


@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single meeting by ID — must belong to current user."""
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id,
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("/meetings/{meeting_id}/summary", response_model=MeetingSummaryResponse)
def get_meeting_summary(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the structured summary for a meeting — must belong to current user."""
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id,
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return MeetingSummaryResponse(
        id=meeting.id,
        title=meeting.title,
        topic=meeting.topic,
        summary=meeting.summary,
        key_points=json.loads(meeting.key_points) if meeting.key_points else [],
        decisions=json.loads(meeting.decisions) if meeting.decisions else [],
        highlights=json.loads(meeting.highlights) if meeting.highlights else [],
        action_items=meeting.action_items,
    )


@router.delete("/meetings/{meeting_id}")
def delete_meeting(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a meeting — must belong to current user."""
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id,
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Clean up the audio file from disk
    if meeting.audio_file_path and os.path.exists(meeting.audio_file_path):
        try:
            os.remove(meeting.audio_file_path)
            logger.info(f"Deleted audio file: {meeting.audio_file_path}")
        except OSError as e:
            logger.warning(f"Failed to delete audio file: {e}")

    db.delete(meeting)
    db.commit()
    return {"detail": "Meeting deleted successfully"}