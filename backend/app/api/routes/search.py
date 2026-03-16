"""
Semantic search endpoint — RAG-powered Q&A across all meeting transcripts.

Pipeline:
  1. Receives a natural language query
  2. Finds relevant transcript chunks via FAISS vector search
  3. Sends chunks + query to an LLM for a grounded answer
  4. Returns ranked results with the AI-generated answer
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.meeting import SearchQuery, SearchResult
from app.services.search import RAGSearchService

router = APIRouter()


@router.post("/search", response_model=list[SearchResult])
def semantic_search(
    body: SearchQuery,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Search across all meeting transcripts using natural language.

    Uses Retrieval-Augmented Generation (RAG):
      - Embeds the query with SentenceTransformers
      - Retrieves top-k matching transcript chunks from FAISS
      - Generates a grounded answer using the configured LLM

    Example query: "What was discussed about the AI project deadline?"
    """
    embedding_service = request.app.state.embedding_service
    search_service = RAGSearchService(embedding_service)

    results = search_service.search(
        query=body.query,
        top_k=body.top_k,
        db=db,
    )

    return results
