import asyncio
import uuid
from datetime import datetime, timezone

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.scrape_task import ScrapeTask
from app.models.content import Content
from app.scrapers.tiktok import TikTokScraper

SCRAPERS = {
    "tiktok": TikTokScraper,
}


@celery_app.task(bind=True, max_retries=3)
def run_scrape_task(self, task_id: str, max_items: int = 100):
    db = SessionLocal()
    try:
        task = db.query(ScrapeTask).filter(ScrapeTask.id == task_id).first()
        if not task:
            return {"error": f"Task {task_id} not found"}

        task.status = "running"
        db.commit()

        scraper_class = SCRAPERS.get(task.platform)
        if not scraper_class:
            task.status = "failed"
            db.commit()
            return {"error": f"No scraper for platform: {task.platform}"}

        scraper = scraper_class()
        results = asyncio.run(scraper.scrape(task.keyword, max_items=max_items))

        count = 0
        for item in results:
            existing = (
                db.query(Content)
                .filter(Content.platform == item["platform"], Content.source_id == item["source_id"])
                .first()
            )
            if existing:
                continue

            content = Content(
                id=uuid.uuid4(),
                task_id=uuid.UUID(task_id),
                platform=item["platform"],
                source_id=item["source_id"],
                content_type=item["content_type"],
                title=item.get("title"),
                body=item.get("body"),
                author=item.get("author"),
                url=item.get("url"),
                metrics=item.get("metrics"),
                published_at=item.get("published_at"),
                raw_data=item.get("raw_data"),
            )
            db.add(content)
            count += 1

        task.status = "completed"
        task.total_items = count
        task.completed_at = datetime.now(timezone.utc)
        db.commit()

        return {"task_id": task_id, "items_scraped": count}

    except Exception as exc:
        task.status = "failed"
        db.commit()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
