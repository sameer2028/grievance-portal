from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Server
    port: int = 8000
    environment: str = "development"

    # Model config
    embedding_model: str = "all-MiniLM-L6-v2"
    classification_threshold: float = 0.45
    duplicate_threshold: float = 0.88

    # CORS
    backend_url: str = "http://localhost:5000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra fields from .env without crashing
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    lru_cache ensures we only parse .env once per process lifetime.
    """
    return Settings()
