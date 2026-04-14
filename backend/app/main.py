from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import STORAGE_DIR, settings
from .database import Base, engine

from .routers.auth import router as auth_router
from .routers.projects import router as projects_router
from .routers.ai import router as ai_router
from .routers.trends import router as trends_router
from .routers.analytics import router as analytics_router

# إنشاء الجداول
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Arabic SaaS platform for content creators",
)

# ======================
# CORS FIX (FINAL)
# ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # مهم: حل نهائي لمشكل register/login
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# STATIC FILES
# ======================
app.mount(
    "/storage",
    StaticFiles(directory=str(STORAGE_DIR)),
    name="storage",
)

# ======================
# ROUTERS
# ======================
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(ai_router)
app.include_router(trends_router)
app.include_router(analytics_router)

# ======================
# ROOT
# ======================
@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "status": "ok",
        "docs": "/docs",
        "storage": str(getattr(settings, "public_storage_url", "")),
    }