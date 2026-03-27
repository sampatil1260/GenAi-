"""
Authentication endpoints — signup and login.
Returns JWT tokens for authenticated sessions.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr

from app.database import get_db
from app.models.user import User
from app.api.auth_deps import create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Request / Response Schemas ───────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: str = Field(..., min_length=5, max_length=500)
    password: str = Field(..., min_length=6, max_length=200)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=500)
    password: str = Field(..., min_length=1, max_length=200)


class AuthResponse(BaseModel):
    token: str
    user: dict


# ── Endpoints ────────────────────────────────────────────────────

@router.post("/auth/signup", response_model=AuthResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and return a JWT token."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=body.name.strip(),
        email=body.email.strip().lower(),
        password_hash=pwd_context.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    logger.info(f"User signed up: {user.email}")
    return AuthResponse(
        token=token,
        user={"id": str(user.id), "name": user.name, "email": user.email, "createdAt": user.created_at.isoformat()},
    )


@router.post("/auth/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.email == body.email.strip().lower()).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(str(user.id))
    logger.info(f"User logged in: {user.email}")
    return AuthResponse(
        token=token,
        user={"id": str(user.id), "name": user.name, "email": user.email, "createdAt": user.created_at.isoformat()},
    )
