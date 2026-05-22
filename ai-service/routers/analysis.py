from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from services.classifier import get_classifier
from services.sentiment_analyzer import get_sentiment_analyzer
from services.urgency_predictor import calculate_urgency
from services.duplicate_detector import get_duplicate_detector
from utils.logger import get_logger
import asyncio

router = APIRouter(prefix="/analyze", tags=["Analysis"])
logger = get_logger(__name__)


class AnalysisRequest(BaseModel):
    grievance_id: str
    title: str
    description: str

    @field_validator("title", "description")
    @classmethod
    def must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class AnalysisResponse(BaseModel):
    grievance_id: str
    category: str
    category_confidence: float
    sentiment: str
    sentiment_score: float
    urgency_score: float
    urgency_level: str
    is_duplicate: bool
    duplicate_of: str | None
    similarity_score: float


@router.post("/", response_model=AnalysisResponse)
async def analyze_grievance(payload: AnalysisRequest):
    """
    Orchestrates all four AI analyses and returns combined results.

    Classification and duplicate detection are I/O bound (model inference),
    so we run them concurrently using asyncio.to_thread to avoid blocking
    the FastAPI event loop.
    """
    try:
        classifier = get_classifier()
        sentiment_analyzer = get_sentiment_analyzer()
        detector = get_duplicate_detector()

        combined_text = f"{payload.title} {payload.description}"

        # Run classifier and duplicate check concurrently (both are CPU-bound but short)
        classification_result, duplicate_result = await asyncio.gather(
            asyncio.to_thread(classifier.predict, payload.title, payload.description),
            asyncio.to_thread(detector.check_duplicate, payload.title, payload.description),
        )

        # Sentiment is fast (rule-based), run synchronously
        sentiment_result = sentiment_analyzer.analyze(combined_text)

        # Urgency uses sentiment score as input
        urgency_result = calculate_urgency(
            payload.title,
            payload.description,
            sentiment_score=sentiment_result["score"],
        )

        # Only register in the embedding store if it's not a duplicate
        if not duplicate_result["is_duplicate"]:
            await asyncio.to_thread(
                detector.add_to_store,
                payload.grievance_id,
                payload.title,
                payload.description,
            )

        logger.info(
            f"Analysis complete for {payload.grievance_id}",
            extra={
                "category": classification_result["category"],
                "sentiment": sentiment_result["sentiment"],
                "urgency": urgency_result["urgency_score"],
                "is_duplicate": duplicate_result["is_duplicate"],
            },
        )

        return AnalysisResponse(
            grievance_id=payload.grievance_id,
            category=classification_result["category"],
            category_confidence=classification_result["confidence"],
            sentiment=sentiment_result["sentiment"],
            sentiment_score=sentiment_result["score"],
            urgency_score=urgency_result["urgency_score"],
            urgency_level=urgency_result["urgency_level"],
            is_duplicate=duplicate_result["is_duplicate"],
            duplicate_of=duplicate_result.get("duplicate_of"),
            similarity_score=duplicate_result["similarity_score"],
        )

    except Exception as e:
        logger.error(f"Analysis failed for {payload.grievance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
