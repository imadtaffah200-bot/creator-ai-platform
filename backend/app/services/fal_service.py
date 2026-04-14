from typing import Any
from fastapi import HTTPException
from ..config import settings


class FalService:
    def _client(self):
        if not settings.fal_key:
            raise HTTPException(status_code=400, detail="FAL_KEY غير مضبوط")
        import fal_client
        fal_client.api_key = settings.fal_key
        return fal_client

    def create_avatar(self, image_url: str, script_text: str, voice: str, prompt: str) -> dict[str, Any]:
        fal_client = self._client()
        result = fal_client.subscribe(
            settings.fal_avatar_model,
            arguments={
                "image_url": image_url,
                "text_input": script_text,
                "voice": voice,
                "prompt": prompt,
                "resolution": "720p",
            },
        )
        video = result.get("video") if isinstance(result, dict) else None
        video_url = video.get("url") if isinstance(video, dict) else result.get("video_url")
        if not video_url:
            raise HTTPException(status_code=500, detail="تعذر إنشاء الأفاتار")
        return {"avatar_url": video_url, "provider_response": result}

    def animate_image(self, image_url: str, prompt: str) -> dict[str, Any]:
        fal_client = self._client()
        result = fal_client.subscribe(
            settings.fal_video_model,
            arguments={
                "prompt": prompt,
                "image_url": image_url,
            },
        )
        video_url = result.get("video", {}).get("url") if isinstance(result, dict) and isinstance(result.get("video"), dict) else result.get("video_url")
        if not video_url:
            raise HTTPException(status_code=500, detail="تعذر تحريك الصورة")
        return {"video_url": video_url, "provider_response": result}


fal_service = FalService()
