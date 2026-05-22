from fastapi import APIRouter
from services.classifier import get_classifier
from services.duplicate_detector import get_duplicate_detector
import time

router = APIRouter(tags=["Health"])
_start_time = time.time()


@router.get("/health")
async def health_check():
    """
    Returns status of the AI service and its loaded models.
    Called by the backend's aiService.checkAIHealth().
    """
    classifier = get_classifier()
    detector = get_duplicate_detector()

    return {
        "status": "ok",
        "service": "grievance-ai-service",
        "uptime_seconds": round(time.time() - _start_time),
        "models": {
            "classifier": "loaded" if classifier.is_trained else "not_loaded",
            "duplicate_detector": "loaded" if detector._is_loaded else "not_loaded",
            "sentiment_analyzer": "loaded",  # VADER is always ready
        },
        "embedding_store_size": len(detector._store),
    }
