"""
Duplicate Detector
-------------------
Model: sentence-transformers (all-MiniLM-L6-v2)
Why: 384-dimension embeddings capture semantic meaning, not just exact string matches.
     Two grievances saying "no water" and "water supply cut" will be detected as similar.

Architecture:
- On startup: embed the last N grievances and store in memory.
- On new grievance: compute embedding, find cosine similarity against stored embeddings.
- If max similarity > threshold → mark as duplicate.

Scale note: For >10k grievances, replace the in-memory store with a vector DB
            (Pinecone, Weaviate, or pgvector). For the hackathon, this is fine.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from utils.logger import get_logger
from config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class DuplicateDetector:
    def __init__(self):
        self.model: SentenceTransformer | None = None
        # In-memory store: list of {"grievance_id": str, "embedding": np.array}
        self._store: list[dict] = []
        self._is_loaded = False

    def load(self):
        """Download and cache the sentence transformer model."""
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)
        self._is_loaded = True
        logger.info("Duplicate detector ready")

    def _embed(self, text: str) -> np.ndarray:
        """Encode a string to a fixed-size embedding vector."""
        return self.model.encode([text], convert_to_numpy=True, normalize_embeddings=True)[0]

    def add_to_store(self, grievance_id: str, title: str, description: str):
        """
        Register a new grievance embedding.
        Call this AFTER confirming the grievance is not a duplicate.
        """
        if not self._is_loaded:
            return

        text = f"{title} {description}"
        embedding = self._embed(text)
        self._store.append({"grievance_id": grievance_id, "embedding": embedding})

        # Keep memory bounded — only last 500 grievances
        # In production, persist these to a vector DB
        if len(self._store) > 500:
            self._store = self._store[-500:]

    def check_duplicate(self, title: str, description: str) -> dict:
        """
        Args:
            title: New grievance title
            description: New grievance description

        Returns:
            {
                "is_duplicate": bool,
                "duplicate_of": str | None,   # grievance_id of the original
                "similarity_score": float
            }
        """
        if not self._is_loaded or len(self._store) == 0:
            return {"is_duplicate": False, "duplicate_of": None, "similarity_score": 0.0}

        text = f"{title} {description}"
        new_embedding = self._embed(text)

        # Stack all stored embeddings into a matrix for batch comparison
        stored_embeddings = np.stack([s["embedding"] for s in self._store])
        similarities = cosine_similarity([new_embedding], stored_embeddings)[0]

        max_idx = int(np.argmax(similarities))
        max_score = float(similarities[max_idx])

        if max_score >= settings.duplicate_threshold:
            return {
                "is_duplicate": True,
                "duplicate_of": self._store[max_idx]["grievance_id"],
                "similarity_score": round(max_score, 4),
            }

        return {
            "is_duplicate": False,
            "duplicate_of": None,
            "similarity_score": round(max_score, 4),
        }


# Singleton
_detector_instance: DuplicateDetector | None = None


def get_duplicate_detector() -> DuplicateDetector:
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = DuplicateDetector()
        _detector_instance.load()
    return _detector_instance
