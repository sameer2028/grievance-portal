"""
Sentiment Analyzer
-------------------
Model: VADER (Valence Aware Dictionary and sEntiment Reasoner) via NLTK
Why: Rule-based, requires no GPU, no model download, works immediately.
     Excellent for short social/complaint text. Compound score is well-calibrated.
     Can upgrade to a transformer model if nuanced sentiment is needed later.
"""

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from utils.logger import get_logger

logger = get_logger(__name__)


def _ensure_vader():
    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        logger.info("Downloading VADER lexicon...")
        nltk.download("vader_lexicon", quiet=True)


_ensure_vader()


class SentimentAnalyzer:
    """
    Wraps VADER for grievance sentiment analysis.
    Returns a label and a compound score normalized to [-1, 1].
    """

    def __init__(self):
        self._sia = SentimentIntensityAnalyzer()

    def analyze(self, text: str) -> dict:
        """
        Args:
            text: Raw grievance title + description (no preprocessing needed for VADER)

        Returns:
            {
                "sentiment": "negative",   # positive | negative | neutral
                "score": -0.72,            # compound score [-1, 1]
                "breakdown": {pos, neg, neu, compound}
            }
        """
        if not text or not isinstance(text, str):
            return {"sentiment": "neutral", "score": 0.0, "breakdown": {}}

        scores = self._sia.polarity_scores(text)
        compound = scores["compound"]

        # VADER thresholds: >= 0.05 positive, <= -0.05 negative
        # Grievance text is almost always negative, so we tighten the threshold slightly
        if compound >= 0.1:
            label = "positive"
        elif compound <= -0.1:
            label = "negative"
        else:
            label = "neutral"

        return {
            "sentiment": label,
            "score": round(compound, 4),
            "breakdown": {
                "positive": round(scores["pos"], 4),
                "negative": round(scores["neg"], 4),
                "neutral": round(scores["neu"], 4),
            },
        }


# Singleton
_analyzer_instance: SentimentAnalyzer | None = None


def get_sentiment_analyzer() -> SentimentAnalyzer:
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = SentimentAnalyzer()
    return _analyzer_instance
