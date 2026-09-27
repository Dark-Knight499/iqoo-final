import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "Creator AI Backend Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    # API Keys & LLM Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    GEMINI_API_KEY: str = ""
    DEFAULT_LLM_MODEL: str = "gemini-1.5-flash"

    # Composio Integration
    COMPOSIO_API_KEY: str = ""
    COMPOSIO_ENTITY_ID: str = "default"

    # Social Platforms
    YOUTUBE_API_KEY: str = ""
    TWITTER_BEARER_TOKEN: str = ""
    APIFY_API_KEY: str = ""
    BRIGHT_DATA_API_KEY: str = ""
    
    # Database Configuration (PostgreSQL)
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'creator_ai.db'}"
    CREATORS_DIR: Path = BASE_DIR / "creators"
    DATA_DIR: Path = BASE_DIR / "data"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
settings.CREATORS_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
