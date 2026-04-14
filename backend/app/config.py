from pathlib import Path
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = BACKEND_DIR / "storage"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_DIR / ".env"), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Creator AI Platform"
    app_env: str = "development"
    jwt_secret_key: str = "change-me-super-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./creator_ai.db"
    backend_cors_origins: List[str] | str = ["http://localhost:5173"]
    base_url: str = "http://localhost:8000"
    public_storage_url: str = "http://localhost:8000/storage"

    openai_api_key: str | None = None
    openai_text_model: str = "gpt-4.1-mini"
    openai_image_model: str = "gpt-image-1"
    openai_tts_model: str = "gpt-4o-mini-tts"
    openai_tts_voice: str = "alloy"
    openai_transcribe_model: str = "whisper-1"

    youtube_api_key: str | None = None
    youtube_region_code: str = "EG"

    apify_token: str | None = None
    apify_tiktok_actor_id: str | None = None
    apify_instagram_actor_id: str | None = None

    fal_key: str | None = None
    fal_avatar_model: str = "fal-ai/ai-avatar/single-text"
    fal_video_model: str = "fal-ai/minimax-video/image-to-video"

    ffmpeg_binary: str = "ffmpeg"
    default_bg_music_url: str | None = None

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def split_cors(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()
for sub in ["images", "audio", "video", "thumbnails", "uploads"]:
    (STORAGE_DIR / sub).mkdir(parents=True, exist_ok=True)
