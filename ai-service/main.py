from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config.settings import get_settings
from routers import analysis, health
from services.classifier import get_classifier
from services.duplicate_detector import get_duplicate_detector
from services.sentiment_analyzer import get_sentiment_analyzer
from utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan handler.
    Code BEFORE yield runs at startup.
    Code AFTER yield runs at shutdown.

    We preload all ML models here so:
    1. The first request doesn't pay the model-loading penalty (~3–10s)
    2. If a model fails to load, the server fails fast at startup (not mid-request)
    """
    logger.info("🚀 AI Service starting up — loading models...")

    # These calls populate the singletons
    get_classifier()
    get_sentiment_analyzer()
    get_duplicate_detector()

    logger.info("✅ All models loaded. AI Service ready.")

    yield  # Server is now running and handling requests

    # Cleanup (if needed in the future)
    logger.info("AI Service shutting down")


# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Grievance AI Service",
    description="ML-powered analysis: classification, sentiment, urgency, duplicate detection",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc UI
)

# CORS — allow calls from our Express backend only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url, "http://localhost:5000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(analysis.router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "Grievance AI",
        "docs": "/docs",
        "health": "/health",
    }


# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
        log_level="info",
    )
