import pytest

from app.scrapers.base import BaseScraper


class DummyScraper(BaseScraper):
    platform = "dummy"

    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        return [{"id": "1", "title": f"Result for {keyword}"}]

    async def parse_item(self, raw_data: dict) -> dict:
        return {"source_id": raw_data["id"], "title": raw_data["title"]}


@pytest.mark.asyncio
async def test_base_scraper_interface():
    scraper = DummyScraper()
    assert scraper.platform == "dummy"
    results = await scraper.scrape("test", max_items=10)
    assert len(results) == 1
    assert results[0]["title"] == "Result for test"


@pytest.mark.asyncio
async def test_base_scraper_parse_item():
    scraper = DummyScraper()
    parsed = await scraper.parse_item({"id": "abc", "title": "Hello"})
    assert parsed["source_id"] == "abc"


def test_cannot_instantiate_base_directly():
    with pytest.raises(TypeError):
        BaseScraper()
