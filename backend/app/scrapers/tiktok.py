import random
from datetime import datetime, timezone
from urllib.parse import quote

from playwright.async_api import async_playwright, Page

from app.scrapers.base import BaseScraper

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]


class TikTokScraper(BaseScraper):
    platform = "tiktok"

    def build_search_url(self, keyword: str) -> str:
        encoded = quote(keyword)
        return f"https://www.tiktok.com/search?q={encoded}"

    async def parse_item(self, raw_data: dict) -> dict:
        stats = raw_data.get("stats", {})
        author = raw_data.get("author", {})
        create_time = raw_data.get("createTime")

        published_at = None
        if create_time:
            published_at = datetime.fromtimestamp(int(create_time), tz=timezone.utc).isoformat()

        return {
            "source_id": str(raw_data.get("id", "")),
            "platform": "tiktok",
            "content_type": "video",
            "title": raw_data.get("desc", ""),
            "body": raw_data.get("desc", ""),
            "author": author.get("uniqueId", ""),
            "url": f"https://www.tiktok.com/@{author.get('uniqueId', '')}/video/{raw_data.get('id', '')}",
            "metrics": {
                "views": stats.get("playCount", 0),
                "likes": stats.get("diggCount", 0),
                "comments": stats.get("commentCount", 0),
                "shares": stats.get("shareCount", 0),
            },
            "published_at": published_at,
            "raw_data": raw_data,
        }

    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={"width": 1920, "height": 1080},
            )
            page = await context.new_page()

            try:
                url = self.build_search_url(keyword)
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await self.random_delay(3, 6)

                results = await self._collect_videos(page, max_items)
            finally:
                await browser.close()

        return results

    async def _collect_videos(self, page: Page, max_items: int) -> list[dict]:
        collected = []
        last_count = 0
        retries = 0
        max_retries = 3

        while len(collected) < max_items and retries < max_retries:
            items = await page.evaluate("""
                () => {
                    const videos = document.querySelectorAll('[data-e2e="search_top-item"]');
                    return Array.from(videos).map(v => {
                        const link = v.querySelector('a');
                        const desc = v.querySelector('[data-e2e="search-card-desc"]');
                        const author = v.querySelector('[data-e2e="search-card-user-unique-id"]');
                        return {
                            url: link ? link.href : '',
                            desc: desc ? desc.textContent : '',
                            author: author ? author.textContent : '',
                        };
                    });
                }
            """)

            for item in items:
                if len(collected) >= max_items:
                    break
                video_id = item.get("url", "").split("/")[-1]
                if video_id and not any(c.get("id") == video_id for c in collected):
                    collected.append({
                        "id": video_id,
                        "desc": item.get("desc", ""),
                        "author": {"uniqueId": item.get("author", "")},
                        "stats": {},
                        "createTime": None,
                    })

            if len(collected) == last_count:
                retries += 1
            else:
                retries = 0
            last_count = len(collected)

            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await self.random_delay(2, 4)

        parsed = []
        for item in collected:
            parsed.append(await self.parse_item(item))
        return parsed
