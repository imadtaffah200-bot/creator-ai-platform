from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..models import Project, User
from ..schemas import AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=AnalyticsResponse)
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.updated_at.desc()).all()
    total = len(projects)
    published = len([p for p in projects if p.status == "published"])
    avg_viral = round(sum((p.viral_score or 0) for p in projects) / total, 2) if total else 0
    grouped = (
        db.query(Project.platform, func.count(Project.id))
        .filter(Project.user_id == current_user.id)
        .group_by(Project.platform)
        .all()
    )
    return AnalyticsResponse(
        total_projects=total,
        published_projects=published,
        avg_viral_score=avg_viral,
        top_platforms=[{"platform": g[0] or "غير محدد", "count": g[1]} for g in grouped],
        latest_projects=projects[:8],
    )
