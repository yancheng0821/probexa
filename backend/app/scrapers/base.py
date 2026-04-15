import asyncio
import random
from abc import ABC, abstractmethod


class BaseScraper(ABC):
    platform: str = ""

    @abstractmethod
    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        """Scrape content for a given keyword. Returns list of raw data dicts."""
        ...

    @abstractmethod
    async def parse_item(self, raw_data: dict) -> dict:
        """Parse raw scraped data into standardized content dict."""
        ...

    async def random_delay(self, min_sec: float = 2.0, max_sec: float = 5.0):
        """Random delay between actions to avoid detection."""
        delay = random.uniform(min_sec, max_sec)
        await asyncio.sleep(delay)
