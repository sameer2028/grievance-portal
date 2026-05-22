"""
Urgency Predictor
------------------
Approach: Weighted keyword matching + sentiment compound score + recency signals.
Why not ML: Urgency labels are rare in datasets. Rule-based gives transparent,
            auditable decisions — important for a government system where you need
            to justify why something was escalated.

Urgency Score: 0.0 (low) → 1.0 (critical)
"""

import re
from utils.logger import get_logger

logger = get_logger(__name__)

# Keywords with urgency weights. Higher = more urgent.
URGENCY_KEYWORDS: dict[str, float] = {
    # Critical — life-threatening
    "death": 1.0, "died": 1.0, "dead": 1.0, "killed": 1.0,
    "accident": 0.9, "fire": 0.9, "flood": 0.9, "collapse": 0.9,
    "hospital emergency": 0.9, "ambulance": 0.9, "unconscious": 0.95,
    "child missing": 1.0, "missing person": 1.0,
    "suicide": 1.0, "attempted suicide": 1.0,

    # High — significant harm
    "bleeding": 0.85, "injury": 0.8, "attack": 0.8, "assault": 0.85,
    "electric shock": 0.85, "gas leak": 0.9, "sewage overflow": 0.75,
    "no water days": 0.75, "epidemic": 0.9, "disease spread": 0.85,
    "contaminated water": 0.8, "food poison": 0.85,

    # Medium — significant inconvenience
    "days": 0.5, "weeks": 0.55, "no electricity": 0.6,
    "no water": 0.6, "broken": 0.45, "not working": 0.4,
    "urgent": 0.65, "immediate": 0.65, "emergency": 0.8,
    "harassment": 0.7, "threat": 0.75, "danger": 0.7,

    # Time pressure signals
    "since last week": 0.55, "months ago": 0.5, "repeated complaint": 0.6,
    "no action": 0.55, "ignored": 0.5, "pending for": 0.5,
    "elderly": 0.55, "senior citizen": 0.55, "pregnant": 0.7, "infant": 0.65,
    "disabled": 0.6, "handicapped": 0.6,

    # Low urgency (informational)
    "suggestion": 0.1, "feedback": 0.1, "inquiry": 0.1,
    "request for information": 0.15,
}


def calculate_urgency(
    title: str,
    description: str,
    sentiment_score: float = 0.0,
) -> dict:
    """
    Args:
        title: Grievance title
        description: Grievance description
        sentiment_score: VADER compound score from sentiment analyzer [-1, 1]

    Returns:
        {
            "urgency_score": 0.78,      # final normalized score [0, 1]
            "matched_keywords": [...],  # for explainability
            "urgency_level": "high"     # low | medium | high | critical
        }
    """
    combined = f"{title.lower()} {description.lower()}"

    matched = []
    keyword_score = 0.0

    for keyword, weight in URGENCY_KEYWORDS.items():
        if re.search(r"\b" + re.escape(keyword) + r"\b", combined):
            matched.append({"keyword": keyword, "weight": weight})
            keyword_score = max(keyword_score, weight)

    # Sentiment contribution: very negative text → higher urgency
    # Map compound [-1, 0] → [0.1, 0] additional urgency boost
    sentiment_boost = max(0.0, -sentiment_score) * 0.15

    # Recency: "since X days/weeks" → moderate boost
    duration_match = re.search(
        r"(\d+)\s*(days?|weeks?|months?)", combined
    )
    duration_boost = 0.0
    if duration_match:
        qty = int(duration_match.group(1))
        unit = duration_match.group(2)
        if "month" in unit:
            duration_boost = min(0.3, qty * 0.05)
        elif "week" in unit:
            duration_boost = min(0.2, qty * 0.04)
        elif "day" in unit:
            duration_boost = min(0.15, qty * 0.015)

    # If no keywords matched, base score on sentiment
    if not matched:
        keyword_score = 0.2  # default minimum

    raw_score = keyword_score + sentiment_boost + duration_boost
    final_score = round(min(1.0, raw_score), 4)

    # Map to level
    if final_score >= 0.8:
        level = "critical"
    elif final_score >= 0.6:
        level = "high"
    elif final_score >= 0.35:
        level = "medium"
    else:
        level = "low"

    return {
        "urgency_score": final_score,
        "matched_keywords": [m["keyword"] for m in matched[:5]],  # top 5 for logs
        "urgency_level": level,
    }
