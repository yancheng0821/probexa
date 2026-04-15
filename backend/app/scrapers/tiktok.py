import asyncio
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

PROXY = {"server": "socks5://127.0.0.1:54321"}


class TikTokScraper(BaseScraper):
    platform = "tiktok"

    def build_search_url(self, keyword: str) -> str:
        encoded = quote(keyword)
        return f"https://www.tiktok.com/search?q={encoded}"

    async def parse_item(self, raw_data: dict) -> dict:
        stats = raw_data.get("stats", {})
        author = raw_data.get("author", "")
        create_time = raw_data.get("createTime")

        published_at = None
        if create_time:
            try:
                published_at = datetime.fromtimestamp(int(create_time), tz=timezone.utc).isoformat()
            except (ValueError, TypeError):
                pass

        video_id = str(raw_data.get("id", ""))
        return {
            "source_id": video_id,
            "platform": "tiktok",
            "content_type": "video",
            "title": raw_data.get("desc", ""),
            "body": raw_data.get("desc", ""),
            "author": author,
            "url": raw_data.get("url", f"https://www.tiktok.com/@{author}/video/{video_id}"),
            "metrics": {
                "views": stats.get("views", 0),
                "likes": stats.get("likes", 0),
                "comments": stats.get("comments", 0),
                "shares": stats.get("shares", 0),
            },
            "published_at": published_at,
            "raw_data": raw_data,
        }

    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, proxy=PROXY)
            context = await browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={"width": 1920, "height": 1080},
            )
            page = await context.new_page()

            try:
                url = self.build_search_url(keyword)
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await asyncio.sleep(12)

                # Step 1: Collect video URLs from search results
                video_urls = await self._collect_video_urls(page, max_items)

                # Step 2: Visit each video page to get details
                for vurl in video_urls:
                    try:
                        detail = await self._scrape_video_detail(page, vurl)
                        if detail:
                            results.append(detail)
                    except Exception:
                        continue
                    await self.random_delay(1, 3)

            finally:
                await browser.close()

        parsed = []
        for item in results:
            parsed.append(await self.parse_item(item))
        return parsed

    async def _collect_video_urls(self, page: Page, max_items: int) -> list[str]:
        """Collect video URLs from search results page."""
        urls = set()
        retries = 0
        max_retries = 3

        while len(urls) < max_items and retries < max_retries:
            new_urls = await page.evaluate("""
                () => {
                    const links = document.querySelectorAll('a[href*="/video/"]');
                    return Array.from(links).map(a => a.href).filter(h => h.includes('/video/'));
                }
            """)

            before = len(urls)
            for u in new_urls:
                if len(urls) >= max_items:
                    break
                urls.add(u)

            if len(urls) == before:
                retries += 1
            else:
                retries = 0

            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await self.random_delay(2, 4)

        return list(urls)[:max_items]

    async def _scrape_video_detail(self, page: Page, url: str) -> dict | None:
        """Visit a video page and extract details."""
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(5)

        detail = await page.evaluate("""
            () => {
                // Try multiple selector patterns (TikTok changes these frequently)
                const getText = (...selectors) => {
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el && el.textContent.trim()) return el.textContent.trim();
                    }
                    return '';
                };

                const getNum = (text) => {
                    if (!text) return 0;
                    text = text.replace(/,/g, '');
                    if (text.includes('K')) return Math.round(parseFloat(text) * 1000);
                    if (text.includes('M')) return Math.round(parseFloat(text) * 1000000);
                    return parseInt(text) || 0;
                };

                // Video description
                const desc = getText(
                    '[data-e2e="browse-video-desc"]',
                    '[data-e2e="video-desc"]',
                    'h1[data-e2e="video-desc"]',
                    'meta[property="og:description"]'
                ) || document.querySelector('meta[property="og:description"]')?.content || '';

                // Author
                const authorEl = document.querySelector(
                    '[data-e2e="browse-username"], [data-e2e="video-author-uniqueid"], a[href*="/@"]'
                );
                let author = '';
                if (authorEl) {
                    const href = authorEl.getAttribute('href') || '';
                    author = href.match(/@([^/]+)/)?.[1] || authorEl.textContent?.trim() || '';
                }
                // Fallback: extract from URL
                if (!author) {
                    author = window.location.pathname.match(/@([^/]+)/)?.[1] || '';
                }

                // Metrics
                const likes = getText('[data-e2e="like-count"], [data-e2e="browse-like-count"]');
                const comments = getText('[data-e2e="comment-count"], [data-e2e="browse-comment-count"]');
                const shares = getText('[data-e2e="share-count"], [data-e2e="browse-share-count"]');

                // Title from meta
                const title = document.querySelector('meta[property="og:title"]')?.content || desc.substring(0, 100);

                return {
                    desc: desc,
                    title: title,
                    author: author,
                    likes: getNum(likes),
                    comments: getNum(comments),
                    shares: getNum(shares),
                };
            }
        """)

        if not detail:
            return None

        # Extract video ID from URL
        video_id = url.split("/video/")[-1].split("?")[0] if "/video/" in url else ""
        author = detail.get("author", "") or url.split("/@")[-1].split("/")[0] if "/@" in url else ""

        return {
            "id": video_id,
            "desc": detail.get("desc", "") or detail.get("title", ""),
            "author": author,
            "url": url,
            "stats": {
                "likes": detail.get("likes", 0),
                "comments": detail.get("comments", 0),
                "shares": detail.get("shares", 0),
                "views": 0,
            },
            "createTime": None,
        }
