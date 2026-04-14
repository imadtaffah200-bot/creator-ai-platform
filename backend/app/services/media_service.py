from pathlib import Path
from moviepy.audio.fx.all import audio_loop
from moviepy.editor import (
    AudioFileClip,
    CompositeAudioClip,
    CompositeVideoClip,
    ImageClip,
    VideoFileClip,
    concatenate_videoclips,
)
from PIL import Image
from ..config import STORAGE_DIR, settings
from ..utils import build_public_url, download_file, estimate_segments, render_subtitle_card, safe_filename


class MediaService:
    def _ensure_local(self, url: str, folder: str, extension: str | None = None) -> Path:
        local_candidate = Path(str(url))
        if local_candidate.exists():
            return local_candidate
        if str(url).startswith(settings.public_storage_url):
            relative = str(url).replace(settings.public_storage_url + "/", "")
            return STORAGE_DIR / relative
        return download_file(str(url), folder=folder, extension=extension)

    def extract_audio_from_video(self, video_url: str) -> Path:
        video_path = self._ensure_local(video_url, folder="uploads", extension="mp4")
        audio_name = safe_filename("extracted", "mp3")
        audio_path = STORAGE_DIR / "audio" / audio_name
        clip = VideoFileClip(str(video_path))
        clip.audio.write_audiofile(str(audio_path), verbose=False, logger=None)
        clip.close()
        return audio_path

    def _make_zoom_clip(self, image_path: Path, duration: float) -> ImageClip:
        base = ImageClip(str(image_path)).resize(height=1920).set_duration(duration)
        def zoom(t):
            return 1 + 0.04 * (t / max(duration, 0.1))
        return base.resize(lambda t: zoom(t)).set_position("center")

    def _subtitle_clip(self, text: str, start: float, end: float) -> ImageClip:
        image = render_subtitle_card(text)
        temp_path = STORAGE_DIR / "uploads" / safe_filename("subtitle", "png")
        image.save(temp_path)
        return (
            ImageClip(str(temp_path))
            .set_start(start)
            .set_end(end)
            .set_position(("center", 1520))
        )

    def build_video(self, script_text: str, image_urls: list[str], audio_url: str, bg_music_url: str | None = None, animated_clip_urls: list[str] | None = None) -> str:
        narration_path = self._ensure_local(audio_url, folder="audio", extension="mp3")
        narration = AudioFileClip(str(narration_path))
        total_duration = narration.duration
        clips = []

        if animated_clip_urls:
            for url in animated_clip_urls:
                local = self._ensure_local(url, folder="video", extension="mp4")
                clip = VideoFileClip(str(local)).resize((1080, 1920))
                clips.append(clip)
            if clips:
                timeline = concatenate_videoclips(clips, method="compose")
                if timeline.duration > total_duration:
                    timeline = timeline.subclip(0, total_duration)
        else:
            per_scene = max(total_duration / max(len(image_urls), 1), 2.5)
            for image_url in image_urls:
                local = self._ensure_local(image_url, folder="images", extension="png")
                clips.append(self._make_zoom_clip(local, per_scene))
            timeline = concatenate_videoclips(clips, method="compose")
            if timeline.duration > total_duration:
                timeline = timeline.subclip(0, total_duration)
            elif timeline.duration < total_duration and clips:
                pad = clips[-1].copy().set_duration(total_duration - timeline.duration)
                timeline = concatenate_videoclips(clips + [pad], method="compose")

        overlays = [timeline.set_audio(narration)]
        for text, start, end in estimate_segments(script_text, total_duration):
            overlays.append(self._subtitle_clip(text, start, end))

        final = CompositeVideoClip(overlays, size=(1080, 1920)).set_duration(total_duration)
        audio_layers = [narration]
        if bg_music_url or settings.default_bg_music_url:
            try:
                music_path = self._ensure_local(bg_music_url or settings.default_bg_music_url, folder="uploads", extension="mp3")
                music = AudioFileClip(str(music_path)).volumex(0.15)
                if music.duration < total_duration:
                    music = audio_loop(music, duration=total_duration)
                audio_layers.append(music.subclip(0, total_duration))
            except Exception:
                pass
        if len(audio_layers) > 1:
            final = final.set_audio(CompositeAudioClip(audio_layers))

        filename = safe_filename("reel", "mp4")
        output_path = STORAGE_DIR / "video" / filename
        final.write_videofile(str(output_path), fps=24, codec="libx264", audio_codec="aac", verbose=False, logger=None)
        final.close()
        narration.close()
        for clip in clips:
            try:
                clip.close()
            except Exception:
                pass
        return build_public_url(output_path)

    def make_thumbnail_from_image(self, image_url: str) -> str:
        local = self._ensure_local(image_url, folder="images", extension="png")
        image = Image.open(local).convert("RGB")
        image = image.resize((1280, 720))
        path = STORAGE_DIR / "thumbnails" / safe_filename("thumb", "jpg")
        image.save(path, quality=92)
        return build_public_url(path)


media_service = MediaService()
