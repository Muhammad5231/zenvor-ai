import asyncio
import os
import re
from typing import List, Dict, Any
import trafilatura
from duckduckgo_search import DDGS
from app.core.config import settings
import yt_dlp

class DeepSearchEngine:
    def __init__(self):
        # Junk domains jo search sources me kabhi nahi aane chahiye
        self.banned_domains = {
            "google.com", "bing.com", "duckduckgo.com", "yahoo.com",
            "facebook.com", "instagram.com", "pinterest.com"
        }

    # -------------------------------------------------------------
    # 1. YOUTUBE CHANNEL RESOLVER (yt-dlp - Never gets blocked)
    # -------------------------------------------------------------
    def extract_youtube_handle(self, text: str) -> str | None:
        match = re.search(r"@([a-zA-Z0-9_\-\.]+)", text)
        return match.group(1) if match else None

    def fetch_youtube_channel_ytdlp(self, handle: str) -> Dict[str, Any] | None:
        """yt-dlp se channel ka real name, bio, aur recent videos extract karna"""
        url = f"https://www.youtube.com/@{handle}"
        ydl_opts = {
            "quiet": True,
            "extract_flat": True,
            "playlistend": 6,
            "skip_download": True,
            "no_warnings": True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    return None

                channel_name = info.get("channel") or info.get("uploader") or f"@{handle}"
                description = info.get("description") or "No description provided."
                entries = info.get("entries") or []

                video_titles = []
                for entry in entries:
                    if entry and entry.get("title"):
                        video_titles.append(entry.get("title"))

                summary = (
                    f"Platform: YouTube Channel\n"
                    f"Channel Name: {channel_name}\n"
                    f"Handle: @{handle}\n"
                    f"Bio / About: {description[:500]}\n"
                )
                if video_titles:
                    summary += "Recent Uploaded Videos / Topics:\n- " + "\n- ".join(video_titles)

                return {
                    "title": f"YouTube: {channel_name} (@{handle})",
                    "url": url,
                    "content": summary
                }
        except Exception as e:
            print(f"[YouTube Scraper] yt-dlp fallback error: {e}")
            return None

    # -------------------------------------------------------------
    # 2. CLEAN SEARCH QUERY BUILDER
    # -------------------------------------------------------------
    def clean_search_query(self, prompt: str) -> str:
        """Stop words aur symbols hata kar saaf keywords banana"""
        cleaned = re.sub(
            r"(?i)\b(search about|search on|in internet|on google|what says people about|what do people say about|tell me about|who is|what is|find information on|new invention or new power of|in acrocc a world|across the world)\b",
            "",
            prompt
        )
        cleaned = re.sub(r"[^\w\s]", " ", cleaned).strip()
        words = [w for w in cleaned.split() if len(w) > 2]
        return " ".join(words[:6])

    # -------------------------------------------------------------
    # 3. REAL-TIME SEARCH (Tavily or Filtered DDG)
    # -------------------------------------------------------------
    # Inside DeepSearchEngine.search_web:
    def search_web(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        tavily_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
        if tavily_key:
            try:
                from tavily import TavilyClient
                client = TavilyClient(api_key=tavily_key)
                response = client.search(
                    query=query,
                    search_depth="basic",
                    max_results=max_results,
                )
                results = []
                for r in response.get("results", []):
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "content": r.get("content", ""),
                    })
                return results
            except Exception as e:
                print(f"[Tavily] Search failed, falling back to local crawl: {e}")

        # Local DDG Fallback with Strict Domain Filtering
        discovered = []
        seen_urls = set()

        with DDGS() as ddgs:
            try:
                # Text search
                raw_results = list(ddgs.text(query, max_results=max_results + 3))
                for r in raw_results:
                    url = r.get("href", "")
                    title = r.get("title", "")
                    domain = re.sub(r"^https?://(www\.)?", "", url).split("/")[0].lower()

                    # Self-redirect aur junk filter (Google/Bing/Yahoo block)
                    if any(b in domain for b in self.banned_domains):
                        continue

                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        discovered.append({
                            "title": title,
                            "url": url,
                            "initial_snippet": r.get("body", "")
                        })
            except Exception as e:
                print(f"[DDGS Error]: {e}")

        return discovered[:max_results]

    # -------------------------------------------------------------
    # 4. DEEP CONTENT EXTRACTOR (Trafilatura)
    # -------------------------------------------------------------
    def extract_full_page_text(self, url: str, fallback_snippet: str = "") -> str:
        """Trafilatura se ads aur boilerplate hata kar asli article text nikalna"""
        try:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return fallback_snippet

            text = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                no_fallback=False
            )
            if text and len(text.strip()) > 150:
                # Local LLM ke context window ke liye clean ~1000 characters
                return re.sub(r"\s+", " ", text)[:1200]
            return fallback_snippet
        except Exception:
            return fallback_snippet

    async def execute_crawl(self, sources: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Sari websites ko parallel crawl karke clean text lena"""
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(
                None,
                self.extract_full_page_text,
                s["url"],
                s.get("initial_snippet", "")
            )
            for s in sources
        ]
        scraped_contents = await asyncio.gather(*tasks)

        final_sources = []
        for src, text in zip(sources, scraped_contents):
            final_sources.append({
                "title": src["title"],
                "url": src["url"],
                "content": text
            })
        return final_sources

deep_search_engine = DeepSearchEngine()