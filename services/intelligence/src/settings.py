"""Settings for the Advent Intelligence service."""

from pydantic import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    openai_temperature: float = 0.7
    openai_max_tokens: int = 1000

    # Redis/Document Store Configuration
    redis_url: str = "redis://localhost:6379"
    memory_ttl_days: int = 365  # Keep memories for a year

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False

    # Logging
    log_level: str = "INFO"

    # Backend API Configuration (for metadata lookups)
    backend_api_url: str = "http://localhost:3001"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()