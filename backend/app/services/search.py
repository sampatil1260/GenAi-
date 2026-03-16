"""
Retrieval-Augmented Generation (RAG) search service.

Pipeline:
  1. User asks a question
  2. EmbeddingService finds relevant transcript chunks via FAISS
  3. Chunks + question are sent to the LLM
  4. LLM generates a grounded answer
"""

import logging
from uuid import UUID

import openai
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.meeting import Meeting
from app.schemas.meeting import SearchResult
from app.services.embeddings import EmbeddingService

logger = logging.getLogger(__name__)
settings = get_settings()

RAG_PROMPT = """You are a meeting intelligence assistant.
Answer the user's question based ONLY on the meeting transcript excerpts provided below.
If the excerpts don't contain enough information, say so honestly.

Meeting Excerpts:
{context}

User Question: {question}

Provide a clear, concise answer. Reference specific meetings when possible.
"""


class RAGSearchService:
    """Combines vector search with LLM reasoning for Q&A over meetings."""

    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service

        if settings.LLM_PROVIDER == "openai":
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        elif settings.LLM_PROVIDER == "gemini":
            self.client = openai.OpenAI(
                api_key=settings.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )

    def search(self, query: str, top_k: int, db: Session) -> list[SearchResult]:
        """
        Execute a RAG search:
          1. Retrieve relevant chunks from FAISS
          2. Build context from chunks
          3. Ask LLM for an answer
          4. Return results with the answer attached to the top result
        """
        # ── Step 1: Vector search ────────────────────────────────
        chunks = self.embedding_service.search(query, top_k=top_k)
        if not chunks:
            return []

        # ── Step 2: Build context ────────────────────────────────
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(
                f"[Meeting: {chunk['meeting_title']}]\n{chunk['chunk']}"
            )
        context = "\n\n---\n\n".join(context_parts)

        # ── Step 3: LLM answer generation ────────────────────────
        model = (
            "gpt-4o-mini" if settings.LLM_PROVIDER == "openai"
            else "gemini-2.5-flash"
        )

        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": RAG_PROMPT.format(context=context, question=query),
                }
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        answer = response.choices[0].message.content.strip()

        # ── Step 4: Build response ───────────────────────────────
        results = []
        for i, chunk in enumerate(chunks):
            results.append(
                SearchResult(
                    meeting_id=UUID(chunk["meeting_id"]),
                    meeting_title=chunk["meeting_title"],
                    relevant_chunk=chunk["chunk"],
                    similarity_score=chunk["score"],
                    answer=answer if i == 0 else None,  # attach answer to top result
                )
            )

        logger.info(f"RAG search: query='{query}', results={len(results)}")
        return results