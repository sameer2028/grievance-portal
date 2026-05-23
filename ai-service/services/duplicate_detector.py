"""
Duplicate Detector (Lightweight TF-IDF Version)
-----------------------------------------------
Model: scikit-learn TfidfVectorizer + Cosine Similarity
Why: Requires 0MB of model loading, uses virtually no RAM, and runs instantly.
     Perfect for the Render 512MB free tier while still providing solid 
     keyword-based duplicate detection.

Architecture:
- On startup: Ready instantly.
- On new grievance: Compute TF-IDF matrix for the new text + stored texts.
- Find cosine similarity. If max similarity > threshold → mark as duplicate.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from utils.logger import get_logger
from config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class DuplicateDetector:
    def __init__(self):
        # In-memory store: list of {"grievance_id": str, "text": str}
        self._store: list[dict] = []
        self._is_loaded = False

    def load(self):
        """Initialize the lightweight detector."""
        logger.info("Initializing lightweight TF-IDF duplicate detector")
        self._is_loaded = True
        logger.info("Duplicate detector ready")

    def add_to_store(self, grievance_id: str, title: str, description: str):
        """
        Register a new grievance text in memory.
        Call this AFTER confirming the grievance is not a duplicate.
        """
        if not self._is_loaded:
            return

        text = f"{title} {description}".lower()
        self._store.append({"grievance_id": grievance_id, "text": text})

        # Keep memory bounded — only last 500 grievances
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
                "duplicate_of": str | None,
                "similarity_score": float
            }
        """
        if not self._is_loaded or len(self._store) == 0:
            return {"is_duplicate": False, "duplicate_of": None, "similarity_score": 0.0}

        new_text = f"{title} {description}".lower()
        
        # Combine the new text (index 0) with all stored texts
        all_texts = [new_text] + [s["text"] for s in self._store]

        # Vectorize on the fly (ignoring common English stop words)
        vectorizer = TfidfVectorizer(stop_words='english')
        
        try:
            tfidf_matrix = vectorizer.fit_transform(all_texts)
        except ValueError:
            # Failsafe if text only contains stop words or is empty
            return {"is_duplicate": False, "duplicate_of": None, "similarity_score": 0.0}

        # Compare index 0 (new_text) to all other rows
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

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