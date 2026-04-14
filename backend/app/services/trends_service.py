from datetime import datetime
from typing import Any
import feedparser
import requests
from ..config import settings


class TrendsService:
    def google_trends(self, country_code: str) -> list[dict[str, Any]]:
        url = f"https://trends.google.com/trending/rss?geo={country_code}"
        feed = feedparser.parse(url)
        items = []
        for entry in feed.entries[:10]:
            items.append(
                {
                    "title": entry.get("title"),
                    "published": entry.get("published"),
                    "link": entry.get("link"),
                }
            )
        return items

    def youtube_trends(self, niche: str, region_code: str) -> list[dict[str, Any]]:
        if not settings.youtube_api_key:
            return []
        params = {
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": region_code or settings.youtube_region_code,
            "maxResults": 10,
            "key": settings.youtube_api_key,
        }
        response = requests.get("https://www.googleapis.com/youtube/v3/videos", params=params, timeout=120)
        response.raise_for_status()
        results = []
        for item in response.json().get("items", []):
            title = item["snippet"].get("title", "")
            if niche and niche.lower() not in title.lower() and niche.lower() not in item["snippet"].get("description", "").lower():
                pass
            results.append(
                {
                    "title": title,
                    "channel": item["snippet"].get("channelTitle"),
                    "published_at": item["snippet"].get("publishedAt"),
                    "views": item.get("statistics", {}).get("viewCount"),
                    "likes": item.get("statistics", {}).get("likeCount"),
                    "video_id": item.get("id"),
                    "url": f"https://www.youtube.com/watch?v={item.get('id')}",
                }
            )
        return results[:10]

    def apify_actor(self, actor_id: str | None, niche: str, label: str) -> list[dict[str, Any]]:
        if not settings.apify_token or not actor_id:
            return []
        url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items"
        payload = {
            "searchTerms": [niche],
            "resultsLimit": 10,
            "sortBy": "popularity",
        }
        response = requests.post(url, params={"token": settings.apify_token}, json=payload, timeout=180)
        response.raise_for_status()
        results = []
        for item in response.json()[:10]:
            results.append(
                {
                    "platform": label,
                    "title": item.get("caption") or item.get("title") or item.get("text"),
                    "author": item.get("authorMeta", {}).get("name") or item.get("ownerUsername") or item.get("username"),
                    "views": item.get("playCount") or item.get("videoPlayCount") or item.get("viewCount"),
                    "likes": item.get("diggCount") or item.get("likesCount") or item.get("likeCount"),
                    "url": item.get("url") or item.get("inputUrl"),
                }
            )
        return results

    def collect(self, niche: str, country_code: str = "EG") -> dict[str, Any]:
        google = self.google_trends(country_code)
        youtube = self.youtube_trends(niche, country_code)
        tiktok = self.apify_actor(settings.apify_tiktok_actor_id, niche, "TikTok")
        instagram = self.apify_actor(settings.apify_instagram_actor_id, niche, "Instagram")
        return {
            "collected_at": datetime.utcnow().isoformat(),
            "google_trends": google,
            "youtube": youtube,
            "tiktok": tiktok,
            "instagram": instagram,
        }


trends_service = TrendsService()
