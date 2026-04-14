from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, EmailStr, Field


class MessageResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str
    niche: str | None = None
    platform: str | None = None
    dialect: str | None = None
    description: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = None
    niche: str | None = None
    platform: str | None = None
    dialect: str | None = None
    description: str | None = None
    status: str | None = None
    idea_text: str | None = None
    script_text: str | None = None
    hooks: list[str] | None = None
    hashtags: list[str] | None = None
    best_posting_times: list[str] | None = None
    trend_snapshot: dict[str, Any] | None = None
    recommendations: list[str] | None = None
    image_urls: list[str] | None = None
    audio_url: str | None = None
    video_url: str | None = None
    avatar_url: str | None = None
    thumbnail_url: str | None = None
    analytics: dict[str, Any] | None = None
    viral_score: float | None = None


class ProjectOut(ProjectBase):
    id: int
    user_id: int
    status: str
    idea_text: str | None = None
    script_text: str | None = None
    hooks: list[str] | None = None
    hashtags: list[str] | None = None
    best_posting_times: list[str] | None = None
    trend_snapshot: dict[str, Any] | None = None
    recommendations: list[str] | None = None
    image_urls: list[str] | None = None
    audio_url: str | None = None
    video_url: str | None = None
    avatar_url: str | None = None
    thumbnail_url: str | None = None
    analytics: dict[str, Any] | None = None
    viral_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IdeasRequest(BaseModel):
    niche: str
    audience: str = "عام"
    dialect: str = "العربية المبسطة"
    platforms: list[str] = ["tiktok", "youtube", "instagram"]
    country_code: str = "EG"
    count: int = 6


class ScriptRequest(BaseModel):
    idea: str
    dialect: str = "العربية المبسطة"
    tone: str = "حماسي"
    platform: str = "tiktok"
    duration_seconds: int = 45
    include_cta: bool = True


class HooksRequest(BaseModel):
    topic: str
    dialect: str = "العربية المبسطة"
    count: int = 8


class ChatRequest(BaseModel):
    message: str
    context: str | None = None
    dialect: str = "العربية المبسطة"


class ImageRequest(BaseModel):
    prompt: str
    style: Literal["واقعي", "كرتوني", "سينمائي"] = "سينمائي"
    size: str = "1024x1536"
    project_id: int | None = None


class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"
    project_id: int | None = None


class AvatarRequest(BaseModel):
    image_url: str
    script_text: str
    voice: str = "Sarah"
    prompt: str = "Arabic talking avatar looking at camera, professional studio light"
    project_id: int | None = None


class ThumbnailRequest(BaseModel):
    topic: str
    subtitle: str | None = None
    style: str = "سينمائي عربي"
    project_id: int | None = None


class VideoBuildRequest(BaseModel):
    script_text: str
    image_urls: list[str]
    audio_url: str
    project_id: int | None = None
    bg_music_url: str | None = None
    animated_clip_urls: list[str] | None = None


class FullPipelineRequest(BaseModel):
    niche: str
    audience: str = "عام"
    dialect: str = "العربية المبسطة"
    platform: str = "tiktok"
    visual_style: str = "سينمائي"
    duration_seconds: int = 45
    project_title: str


class TrendInsightResponse(BaseModel):
    sources: dict[str, Any]
    hashtags: list[str]
    best_posting_times: list[str]
    insights: list[str]


class RecommendationRequest(BaseModel):
    niche: str
    recent_scripts: list[str] = []
    goal: str = "رفع الوصول والتفاعل"


class ExtractedScriptResponse(BaseModel):
    transcript: str
    cleaned_script: str


class AnalyticsResponse(BaseModel):
    total_projects: int
    published_projects: int
    avg_viral_score: float
    top_platforms: list[dict[str, Any]]
    latest_projects: list[ProjectOut]


TokenResponse.model_rebuild()
