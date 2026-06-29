"""
Image Analyzer Module
---------------------
Analyzes attached proof images and visual signals to complement text classification
and urgency evaluation in public grievances.
"""

from utils.logger import get_logger

logger = get_logger(__name__)

# Keywords in image file names/paths that give domain-specific context
IMAGE_DOMAIN_KEYWORDS = {
    "roads_infrastructure": ["tree", "road", "path", "asphalt", "street", "pothole", "crack", "bridge", "traffic", "blocking"],
    "water_supply": ["water", "pipe", "leak", "drain", "tap", "meter", "overflow", "tank"],
    "electricity": ["wire", "pole", "spark", "transformer", "meter", "current", "cable", "blackout"],
    "sanitation": ["garbage", "trash", "waste", "sewage", "dump", "dirty", "dumpster", "cleanliness"],
    "health": ["hospital", "clinic", "medicine", "doctor", "patient", "ward", "bed"],
}


def analyze_attachments(attachments: list[str]) -> dict:
    """
    Args:
        attachments: List of attachment URLs or filenames.

    Returns:
        {
            "has_images": bool,
            "attachment_count": int,
            "urgency_boost": float,
            "confidence_boost": float,
            "detected_department_hints": list[str]
        }
    """
    if not attachments or len(attachments) == 0:
        return {
            "has_images": False,
            "attachment_count": 0,
            "urgency_boost": 0.0,
            "confidence_boost": 0.0,
            "detected_department_hints": []
        }

    attachment_count = len(attachments)
    # Having photo proof increases urgency & overall verification confidence
    urgency_boost = min(0.12, 0.08 + (attachment_count - 1) * 0.02)
    confidence_boost = min(0.15, 0.05 * attachment_count)

    hints = []
    combined_urls = " ".join(attachments).lower()

    for dept, keywords in IMAGE_DOMAIN_KEYWORDS.items():
        if any(kw in combined_urls for kw in keywords):
            hints.append(dept)

    logger.info(f"Analyzed {attachment_count} image attachments", extra={"urgency_boost": urgency_boost, "hints": hints})

    return {
        "has_images": True,
        "attachment_count": attachment_count,
        "urgency_boost": round(urgency_boost, 4),
        "confidence_boost": round(confidence_boost, 4),
        "detected_department_hints": hints
    }
