import io
import re
import uuid
from pathlib import Path
from typing import Iterable
import arabic_reshaper
import requests
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
from .config import STORAGE_DIR, settings


def safe_filename(prefix: str, extension: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}.{extension}"


def write_bytes(folder: str, content: bytes, extension: str, prefix: str) -> str:
    filename = safe_filename(prefix, extension)
    path = STORAGE_DIR / folder / filename
    path.write_bytes(content)
    return build_public_url(path)


def build_public_url(path: str | Path) -> str:
    path = Path(path)
    relative = path.relative_to(STORAGE_DIR).as_posix()
    return f"{settings.public_storage_url}/{relative}"


def download_file(url: str, folder: str = "uploads", extension: str | None = None) -> Path:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    ext = extension or url.split("?")[0].split(".")[-1] or "bin"
    filename = safe_filename(folder, ext)
    path = STORAGE_DIR / folder / filename
    path.write_bytes(response.content)
    return path


def split_sentences_ar(text: str) -> list[str]:
    parts = re.split(r"(?<=[\.\!\؟\!\?\n])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def estimate_segments(text: str, total_duration: float) -> list[tuple[str, float, float]]:
    sentences = split_sentences_ar(text) or [text]
    total_chars = sum(max(len(s), 1) for s in sentences)
    cursor = 0.0
    segments = []
    for sentence in sentences:
        duration = total_duration * (len(sentence) / total_chars)
        start = cursor
        end = cursor + max(duration, 1.2)
        segments.append((sentence, start, end))
        cursor = end
    if segments:
        last_text, start, _ = segments[-1]
        segments[-1] = (last_text, start, total_duration)
    return segments


def get_arabic_font(size: int = 54) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def render_subtitle_card(text: str, width: int = 980, padding: int = 36) -> Image.Image:
    reshaped = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped)
    font = get_arabic_font(56)
    dummy = Image.new("RGBA", (width, 400), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dummy)
    lines: list[str] = []
    words = bidi_text.split(" ")
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] > width - padding * 2 and current:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    line_height = 86
    height = padding * 2 + line_height * len(lines)
    img = Image.new("RGBA", (width, height), (15, 23, 42, 210))
    draw = ImageDraw.Draw(img)
    for idx, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        x = (width - (bbox[2] - bbox[0])) // 2
        y = padding + idx * line_height
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
    return img


def chunks(iterable: Iterable, size: int):
    bucket = []
    for item in iterable:
        bucket.append(item)
        if len(bucket) == size:
            yield bucket
            bucket = []
    if bucket:
        yield bucket
