from fastapi import APIRouter, Depends
from ..deps import get_current_user
from ..models import User
from ..schemas import TrendInsightResponse
from ..services.openai_service import openai_service
from ..services.trends_service import trends_service

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("/daily", response_model=TrendInsightResponse)
def daily_trends(niche: str = "عام", country_code: str = "EG", current_user: User = Depends(get_current_user)):
    trend_context = trends_service.collect(niche=niche, country_code=country_code)
    enriched = openai_service.generate_hashtags_and_times(niche=niche, trend_context=trend_context)
    return TrendInsightResponse(
        sources=trend_context,
        hashtags=enriched.get("hashtags", []),
        best_posting_times=enriched.get("best_posting_times", []),
        insights=enriched.get("insights", []) + enriched.get("recommendations", []),
    )
