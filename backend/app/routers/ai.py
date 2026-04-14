from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..models import Project, User
from ..schemas import (
    AvatarRequest,
    ChatRequest,
    ExtractedScriptResponse,
    FullPipelineRequest,
    HooksRequest,
    IdeasRequest,
    ImageRequest,
    RecommendationRequest,
    ScriptRequest,
    ThumbnailRequest,
    TTSRequest,
    VideoBuildRequest,
)
from ..services.fal_service import fal_service
from ..services.media_service import media_service
from ..services.openai_service import openai_service
from ..services.trends_service import trends_service
from ..utils import safe_filename
from ..config import STORAGE_DIR

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _score_content(text: str, trend_context: dict | None = None) -> float:
    score = 48.0
    text = text or ""
    if len(text) > 180:
        score += 8
    if any(word in text for word in ["ليه", "كيف", "أسرار", "مفاجأة", "السبب", "قبل ما", "لا تعمل"]):
        score += 12
    if any(word in text for word in ["تابع", "احفظ", "شارك", "اكتب", "جرّب"]):
        score += 8
    if trend_context and any(trend_context.get(source) for source in ["youtube", "tiktok", "instagram", "google_trends"]):
        score += 15
    score += min(text.count("؟") * 2, 6)
    return min(round(score, 2), 99.0)


def _project_or_none(db: Session, project_id: int | None, user_id: int):
    if not project_id:
        return None
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    return project


@router.post("/ideas")
def generate_ideas(payload: IdeasRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trend_context = trends_service.collect(payload.niche, payload.country_code)
    result = openai_service.generate_ideas(
        niche=payload.niche,
        audience=payload.audience,
        dialect=payload.dialect,
        platforms=payload.platforms,
        trend_context=trend_context,
        count=payload.count,
    )
    result["viral_score"] = _score_content(" ".join(i.get("title", "") for i in result.get("ideas", [])), trend_context)
    return {"trend_context": trend_context, **result}


@router.post("/script")
def generate_script(payload: ScriptRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = openai_service.generate_script(
        idea=payload.idea,
        dialect=payload.dialect,
        tone=payload.tone,
        platform=payload.platform,
        duration_seconds=payload.duration_seconds,
        include_cta=payload.include_cta,
    )
    result["viral_score"] = _score_content(result.get("full_script", ""))
    return result


@router.post("/hooks")
def hooks(payload: HooksRequest, current_user: User = Depends(get_current_user)):
    return openai_service.generate_hooks(payload.topic, payload.dialect, payload.count)


@router.post("/chat")
def assistant_chat(payload: ChatRequest, current_user: User = Depends(get_current_user)):
    return {"reply": openai_service.assistant_reply(payload.message, payload.context, payload.dialect)}


@router.post("/recommendations")
def recommendations(payload: RecommendationRequest, current_user: User = Depends(get_current_user)):
    return openai_service.generate_recommendations(payload.niche, payload.recent_scripts, payload.goal)


@router.post("/image")
def generate_image(payload: ImageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    image_url = openai_service.generate_image(payload.prompt, payload.style, payload.size)
    project = _project_or_none(db, payload.project_id, current_user.id)
    if project:
        project.image_urls = (project.image_urls or []) + [image_url]
        project.viral_score = max(project.viral_score or 0, _score_content(payload.prompt))
        db.add(project)
        db.commit()
    return {"image_url": image_url}


@router.post("/tts")
def tts(payload: TTSRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    audio_url = openai_service.text_to_speech(payload.text, payload.voice)
    project = _project_or_none(db, payload.project_id, current_user.id)
    if project:
        project.audio_url = audio_url
        db.add(project)
        db.commit()
    return {"audio_url": audio_url}


@router.post("/avatar")
def avatar(payload: AvatarRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = fal_service.create_avatar(payload.image_url, payload.script_text, payload.voice, payload.prompt)
    project = _project_or_none(db, payload.project_id, current_user.id)
    if project:
        project.avatar_url = result["avatar_url"]
        db.add(project)
        db.commit()
    return result


@router.post("/thumbnail")
def thumbnail(payload: ThumbnailRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prompt = openai_service.generate_thumbnail_prompt(payload.topic, payload.subtitle, payload.style)
    image_url = openai_service.generate_image(prompt, style="سينمائي", size="1536x1024")
    thumb_url = media_service.make_thumbnail_from_image(image_url)
    project = _project_or_none(db, payload.project_id, current_user.id)
    if project:
        project.thumbnail_url = thumb_url
        db.add(project)
        db.commit()
    return {"thumbnail_url": thumb_url, "prompt": prompt}


@router.post("/build-video")
def build_video(payload: VideoBuildRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    video_url = media_service.build_video(
        script_text=payload.script_text,
        image_urls=payload.image_urls,
        audio_url=payload.audio_url,
        bg_music_url=payload.bg_music_url,
        animated_clip_urls=payload.animated_clip_urls,
    )
    project = _project_or_none(db, payload.project_id, current_user.id)
    if project:
        project.video_url = video_url
        project.status = "ready"
        db.add(project)
        db.commit()
    return {"video_url": video_url}


@router.post("/extract-script-from-video", response_model=ExtractedScriptResponse)
def extract_script_from_video(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    suffix = file.filename.split(".")[-1] if file.filename and "." in file.filename else "mp4"
    target = STORAGE_DIR / "uploads" / safe_filename("uploaded_video", suffix)
    target.write_bytes(file.file.read())
    audio_path = media_service.extract_audio_from_video(str(target))
    transcript = openai_service.transcribe_file(str(audio_path))
    cleaned_script = openai_service.assistant_reply(
        message="حوّل التفريغ التالي إلى سكربت فيديو قصير واضح ومرتب مع الحفاظ على المعنى:\n" + transcript,
        context=None,
        dialect="العربية المبسطة",
    )
    return ExtractedScriptResponse(transcript=transcript, cleaned_script=cleaned_script)


@router.post("/full-content")
def full_content(payload: FullPipelineRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(
        user_id=current_user.id,
        title=payload.project_title,
        niche=payload.niche,
        platform=payload.platform,
        dialect=payload.dialect,
        status="processing",
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    trend_context = trends_service.collect(payload.niche)
    ideas = openai_service.generate_ideas(payload.niche, payload.audience, payload.dialect, [payload.platform], trend_context, 3)
    selected_idea = ideas.get("ideas", [{}])[0].get("title", payload.niche)
    script = openai_service.generate_script(selected_idea, payload.dialect, "حماسي", payload.platform, payload.duration_seconds, True)
    hooks = openai_service.generate_hooks(selected_idea, payload.dialect, 6).get("hooks", [])
    image_prompts = [scene.get("visual") for scene in script.get("shot_list", [])][:4] or [script.get("title", selected_idea)]
    image_urls = [openai_service.generate_image(prompt, payload.visual_style) for prompt in image_prompts]
    audio_url = openai_service.text_to_speech(script.get("full_script", selected_idea), "alloy")
    animated_clips = []
    if current_user and image_urls:
        try:
            animated_clips = [fal_service.animate_image(url, f"Create dynamic vertical social media motion for: {selected_idea}")["video_url"] for url in image_urls[:2]]
        except Exception:
            animated_clips = []
    video_url = media_service.build_video(
        script_text=script.get("full_script", selected_idea),
        image_urls=image_urls,
        audio_url=audio_url,
        animated_clip_urls=animated_clips,
    )
    thumb = media_service.make_thumbnail_from_image(image_urls[0])
    enrich = openai_service.generate_hashtags_and_times(payload.niche, trend_context)
    viral_score = _score_content(script.get("full_script", ""), trend_context)

    project.idea_text = selected_idea
    project.script_text = script.get("full_script")
    project.hooks = hooks
    project.hashtags = enrich.get("hashtags", [])
    project.best_posting_times = enrich.get("best_posting_times", [])
    project.trend_snapshot = trend_context
    project.recommendations = enrich.get("recommendations", [])
    project.image_urls = image_urls
    project.audio_url = audio_url
    project.video_url = video_url
    project.thumbnail_url = thumb
    project.analytics = {
        "title": script.get("title"),
        "hook": script.get("hook"),
        "insights": enrich.get("insights", []),
        "shot_list": script.get("shot_list", []),
    }
    project.viral_score = viral_score
    project.status = "ready"
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "project_id": project.id,
        "idea": selected_idea,
        "script": script,
        "hooks": hooks,
        "image_urls": image_urls,
        "audio_url": audio_url,
        "video_url": video_url,
        "thumbnail_url": thumb,
        "hashtags": project.hashtags,
        "best_posting_times": project.best_posting_times,
        "viral_score": viral_score,
    }
