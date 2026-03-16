"""
Embedding service using SentenceTransformers + FAISS.

Responsibilities:
  - Chunk transcripts into overlapping segments
  - Encode chunks as dense vectors
  - Store and retrieve vectors via FAISS
  - Persist index to disk for durability
"""

import os
import json
import logging
from typing import Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmbeddingService:
    """Manages the FAISS vector index and SentenceTransformer model."""

    def __init__(self):
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.dimension = self.model.get_sentence_embedding_dimension()

        # FAISS index (Inner Product after L2-normalization ≈ cosine similarity)
        self.index = faiss.IndexFlatIP(self.dimension)

        # Metadata store — maps FAISS row index → chunk info
        self.metadata: list[dict] = []

        # Load existing index if available
        self._load_index()

    # ── Public API ───────────────────────────────────────────────

    def add_meeting(self, meeting_id: str, meeting_title: str, text: str):
        """Chunk, embed, and index a meeting transcript."""
        chunks = self._chunk_text(text, chunk_size=500, overlap=100)
        if not chunks:
            return

        embeddings = self.model.encode(chunks, normalize_embeddings=True)
        embeddings = np.array(embeddings, dtype="float32")

        start_idx = self.index.ntotal
        self.index.add(embeddings)

        for i, chunk in enumerate(chunks):
            self.metadata.append({
                "faiss_idx": start_idx + i,
                "meeting_id": meeting_id,
                "meeting_title": meeting_title,
                "chunk": chunk,
            })

        self.save_index()
        logger.info(
            f"Indexed {len(chunks)} chunks for meeting '{meeting_title}'"
        )

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """
        Find the most relevant transcript chunks for a query.

        Returns list of dicts with: meeting_id, meeting_title, chunk, score
        """
        if self.index.ntotal == 0:
            return []

        query_embedding = self.model.encode(
            [query], normalize_embeddings=True
        ).astype("float32")

        scores, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            meta = self.metadata[idx]
            results.append({
                "meeting_id": meta["meeting_id"],
                "meeting_title": meta["meeting_title"],
                "chunk": meta["chunk"],
                "score": float(score),
            })

        return results

    # ── Persistence ──────────────────────────────────────────────

    def save_index(self):
        """Persist FAISS index and metadata to disk."""
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH) or "data", exist_ok=True)
        faiss.write_index(self.index, f"{settings.FAISS_INDEX_PATH}.faiss")
        with open(f"{settings.FAISS_INDEX_PATH}.meta.json", "w") as f:
            json.dump(self.metadata, f)
        logger.info(f"Saved FAISS index ({self.index.ntotal} vectors)")

    def _load_index(self):
        """Load FAISS index from disk if it exists."""
        faiss_path = f"{settings.FAISS_INDEX_PATH}.faiss"
        meta_path = f"{settings.FAISS_INDEX_PATH}.meta.json"

        if os.path.exists(faiss_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(faiss_path)
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            logger.info(f"Loaded FAISS index ({self.index.ntotal} vectors)")

    # ── Chunking ─────────────────────────────────────────────────

    @staticmethod
    def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
        """
        Split text into overlapping chunks for embedding.

        Uses word boundaries to avoid cutting mid-word.
        """
        words = text.split()
        chunks = []
        start = 0

        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            if chunk.strip():
                chunks.append(chunk.strip())
            start += chunk_size - overlap

        return chunks