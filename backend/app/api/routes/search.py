"""
Semantic search endpoint — RAG-powered Q&A across the current user's meeting transcripts.

Pipeline:
  1. Receives a natural language query
  2. Finds relevant transcript chunks via FAISS vector search
  3. Filters results to only include current user's meetings
  4. Sends chunks + query to an LLM for a grounded answer
  5. Returns ranked results with the AI-generated answer
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.meeting import SearchQuery, SearchResult
from app.api.auth_deps import get_current_user
from app.services.search import RAGSearchService

router = APIRouter()


@router.post("/search", response_model=list[SearchResult])
def semantic_search(
    body: SearchQuery,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search across the current user's meeting transcripts using natural language.
    Results are filtered to only include meetings owned by the authenticated user.
    """
    embedding_service = request.app.state.embedding_service
    search_service = RAGSearchService(embedding_service)

    results = search_service.search(
        query=body.query,
        top_k=body.top_k,
        db=db,
        user_id=str(current_user.id),
    )

    return results
