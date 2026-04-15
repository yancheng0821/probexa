import pytest

from app.scrapers.tiktok import TikTokScraper


def test_tiktok_scraper_platform():
    scraper = TikTokScraper()
    assert scraper.platform == "tiktok"


@pytest.mark.asyncio
async def test_parse_item():
    scraper = TikTokScraper()
    raw = {
        "id": "7321456789",
        "desc": "Best wireless earbuds review",
        "author": {"uniqueId": "techreviewer"},
        "stats": {"playCount": 50000, "diggCount": 2000, "commentCount": 150, "shareCount": 80},
        "createTime": 1710000000,
    }
    parsed = await scraper.parse_item(raw)
    assert parsed["source_id"] == "7321456789"
    assert parsed["content_type"] == "video"
    assert parsed["platform"] == "tiktok"
    assert parsed["title"] == "Best wireless earbuds review"
    assert parsed["author"] == "techreviewer"
    assert parsed["metrics"]["views"] == 50000
    assert parsed["metrics"]["likes"] == 2000


def test_build_search_url():
    scraper = TikTokScraper()
    url = scraper.build_search_url("wireless earbuds")
    assert "wireless" in url
    assert "earbuds" in url
