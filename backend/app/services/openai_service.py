import base64
import json
from typing import Any
import requests
from fastapi import HTTPException
from ..config import settings
from ..utils import write_bytes


class OpenAIService:
    base_url = "https://api.openai.com/v1"

    def _headers(self) -> dict[str, str]:
        if not settings.openai_api_key:
            raise HTTPException(status_code=400, detail="OPENAI_API_KEY غير مضبوط")
        return {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        }

    def chat(self, system_prompt: str, user_prompt: str, response_json: bool = False) -> Any:
        payload: dict[str, Any] = {
            "model": settings.openai_text_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.8,
        }
        if response_json:
            payload["response_format"] = {"type": "json_object"}
        response = requests.post(f"{self.base_url}/chat/completions", headers=self._headers(), json=payload, timeout=180)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        if response_json:
            return json.loads(content)
        return content

    def generate_ideas(self, niche: str, audience: str, dialect: str, platforms: list[str], trend_context: dict, count: int) -> dict:
        system_prompt = (
            "أنت خبير نمو لصنّاع المحتوى العرب. أعد النتيجة بصيغة JSON فقط، وركّز على أفكار Viral قابلة للتنفيذ الآن، "
            "مع ربط كل فكرة بسياق الترند، صياغة عربية جذابة، وتوصية بخطاف أول 3 ثوانٍ."
        )
        user_prompt = f"""
        المجال: {niche}
        الجمهور: {audience}
        اللهجة المطلوبة: {dialect}
        المنصات: {', '.join(platforms)}
        بيانات الترندات الحالية:
        {json.dumps(trend_context, ensure_ascii=False)}

        أرجع JSON بهذا الشكل:
        {{
          "ideas": [
            {{"title": "", "angle": "", "why_now": "", "hook": "", "platform_fit": "", "viral_score_hint": 0}}
          ],
          "insights": [""],
          "hashtags": ["#..."],
          "best_posting_times": [""],
          "recommendations": [""]
        }}
        وامنحني {count} أفكار بالضبط.
        """
        return self.chat(system_prompt, user_prompt, response_json=True)

    def generate_script(self, idea: str, dialect: str, tone: str, platform: str, duration_seconds: int, include_cta: bool) -> dict:
        system_prompt = (
            "أنت كاتب سكربتات قصيرة احترافية لصنّاع المحتوى العرب. أعد JSON فقط. "
            "السكريبت لازم يكون سهل الإلقاء، مقسّم بوضوح إلى Hook وBody وStorytelling وCTA، ويدعم اللهجة المطلوبة."
        )
        user_prompt = f"""
        الفكرة: {idea}
        اللهجة: {dialect}
        النبرة: {tone}
        المنصة: {platform}
        المدة المستهدفة: {duration_seconds} ثانية
        CTA مطلوب: {'نعم' if include_cta else 'لا'}

        JSON المطلوب:
        {{
          "title": "",
          "hook": "",
          "storytelling": ["", ""],
          "main_points": ["", "", ""],
          "cta": "",
          "full_script": "",
          "shot_list": [{{"scene": 1, "visual": "", "subtitle": ""}}],
          "thumbnail_copy": "",
          "estimated_duration": {duration_seconds}
        }}
        """
        return self.chat(system_prompt, user_prompt, response_json=True)

    def generate_hooks(self, topic: str, dialect: str, count: int) -> dict:
        system_prompt = "أنت مولد Hook احترافي لمقاطع Reels وShorts باللغة العربية. أعد JSON فقط."
        user_prompt = f"الموضوع: {topic}\nاللهجة: {dialect}\nأنتج {count} Hooks قوية جدًا بصيغة JSON: {{\"hooks\": [\"...\"]}}"
        return self.chat(system_prompt, user_prompt, response_json=True)

    def assistant_reply(self, message: str, context: str | None, dialect: str) -> str:
        system_prompt = (
            "أنت مساعد ذكي داخل منصة لصناع المحتوى العرب. تجاوب بالعربية وباللهجة المطلوبة إن أمكن، وتقدّم تحسينات مباشرة وقابلة للنشر."
        )
        user_prompt = f"السياق: {context or 'لا يوجد'}\nاللهجة: {dialect}\nرسالة المستخدم: {message}"
        return self.chat(system_prompt, user_prompt)

    def generate_hashtags_and_times(self, niche: str, trend_context: dict) -> dict:
        system_prompt = "أنت محلل نمو ومختص توزيع محتوى. أعد JSON فقط."
        user_prompt = f"""
        المجال: {niche}
        بيانات الترند: {json.dumps(trend_context, ensure_ascii=False)}

        أرجع JSON بالشكل:
        {{
          "hashtags": ["#..."],
          "best_posting_times": [""],
          "insights": [""],
          "recommendations": [""]
        }}
        """
        return self.chat(system_prompt, user_prompt, response_json=True)

    def generate_recommendations(self, niche: str, recent_scripts: list[str], goal: str) -> dict:
        system_prompt = "أنت محرك توصيات ذكي لصنّاع المحتوى. أعد JSON فقط."
        user_prompt = f"المجال: {niche}\nالهدف: {goal}\nآخر السكربتات: {json.dumps(recent_scripts, ensure_ascii=False)}\nأعد JSON: {{\"recommendations\": [\"...\"], \"next_content_angles\": [\"...\"]}}"
        return self.chat(system_prompt, user_prompt, response_json=True)

    def generate_thumbnail_prompt(self, topic: str, subtitle: str | None, style: str) -> str:
        system_prompt = "أنت خبير Thumbnail عربي لليوتيوب والريلز."
        user_prompt = f"اصنع Prompt إنجليزي قصير ودقيق لتوليد Thumbnail عن: {topic}. العنوان الفرعي: {subtitle or ''}. الستايل: {style}."
        return self.chat(system_prompt, user_prompt)

    def generate_image(self, prompt: str, style: str = "سينمائي", size: str = "1024x1536") -> str:
        styled_prompt = f"{prompt}. Visual style: {style}. Arabic creator economy, premium, social-media-ready, detailed composition"
        payload = {
            "model": settings.openai_image_model,
            "prompt": styled_prompt,
            "size": size,
        }
        response = requests.post(f"{self.base_url}/images/generations", headers=self._headers(), json=payload, timeout=300)
        response.raise_for_status()
        data = response.json()["data"][0]
        if data.get("b64_json"):
            image_bytes = base64.b64decode(data["b64_json"])
            return write_bytes("images", image_bytes, "png", "image")
        if data.get("url"):
            file_response = requests.get(data["url"], timeout=180)
            file_response.raise_for_status()
            return write_bytes("images", file_response.content, "png", "image")
        raise HTTPException(status_code=500, detail="تعذر قراءة صورة OpenAI")

    def text_to_speech(self, text: str, voice: str) -> str:
        if not settings.openai_api_key:
            raise HTTPException(status_code=400, detail="OPENAI_API_KEY غير مضبوط")
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.openai_tts_model,
            "voice": voice or settings.openai_tts_voice,
            "input": text,
            "format": "mp3",
        }
        response = requests.post(f"{self.base_url}/audio/speech", headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        return write_bytes("audio", response.content, "mp3", "tts")

    def transcribe_file(self, file_path: str) -> str:
        if not settings.openai_api_key:
            raise HTTPException(status_code=400, detail="OPENAI_API_KEY غير مضبوط")
        with open(file_path, "rb") as audio_file:
            response = requests.post(
                f"{self.base_url}/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                data={"model": settings.openai_transcribe_model},
                files={"file": audio_file},
                timeout=300,
            )
        response.raise_for_status()
        return response.json().get("text", "")


openai_service = OpenAIService()
