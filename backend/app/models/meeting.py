"""
SQLAlchemy ORM models for meetings and action items.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Integer, Float
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    audio_file_path = Column(String(1000), nullable=True)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    topic = Column(String(500), nullable=True)
    key_points = Column(Text, nullable=True)          # JSON-encoded list
    decisions = Column(Text, nullable=True)            # JSON-encoded list
    highlights = Column(Text, nullable=True)           # JSON-encoded list
    duration_seconds = Column(Float, nullable=True)
    status = Column(
        String(50), nullable=False, default="uploaded"
    )  # uploaded → transcribing → summarizing → completed → failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    action_items = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan"
    )


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )
    assignee = Column(String(200), nullable=False)
    task = Column(Text, nullable=False)
    priority = Column(String(50), default="medium")    # low, medium, high
    status = Column(String(50), default="pending")     # pending, in_progress, done
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")