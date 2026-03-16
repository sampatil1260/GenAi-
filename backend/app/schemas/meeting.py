"""
Pydantic schemas for request validation and response serialization.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Request Schemas ──────────────────────────────────────────────

class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)


class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=20)


# ── Response Schemas ─────────────────────────────────────────────

class ActionItemResponse(BaseModel):
    id: UUID
    assignee: str
    task: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingResponse(BaseModel):
    id: UUID
    title: str
    status: str
    transcript: Optional[str] = None
    duration_seconds: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    action_items: list[ActionItemResponse] = []

    class Config:
        from_attributes = True


class MeetingSummaryResponse(BaseModel):
    id: UUID
    title: str
    topic: Optional[str] = None
    summary: Optional[str] = None
    key_points: Optional[list[str]] = None
    decisions: Optional[list[str]] = None
    highlights: Optional[list[str]] = None
    action_items: list[ActionItemResponse] = []

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    meeting_id: UUID
    meeting_title: str
    relevant_chunk: str
    similarity_score: float
    answer: Optional[str] = None