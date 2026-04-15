from celery.schedules import crontab

from app.core.database import SessionLocal
from app.models.scheduled_job import ScheduledJob
from app.tasks.celery_app import celery_app


def parse_cron(expression: str) -> dict:
    """Parse '0 8 * * *' into celery crontab kwargs."""
    parts = expression.split()
    if len(parts) != 5:
        raise ValueError(f"Invalid cron expression: {expression}")
    return {
        "minute": parts[0],
        "hour": parts[1],
        "day_of_month": parts[2],
        "month_of_year": parts[3],
        "day_of_week": parts[4],
    }


def load_schedules_into_beat():
    """Load active scheduled jobs from DB into Celery Beat schedule."""
    db = SessionLocal()
    try:
        jobs = db.query(ScheduledJob).filter(ScheduledJob.is_active == True).all()
        beat_schedule = {}
        for job in jobs:
            cron_kwargs = parse_cron(job.cron_expression)
            beat_schedule[f"scrape-{job.id}"] = {
                "task": "app.tasks.scrape_tasks.run_scrape_task",
                "schedule": crontab(**cron_kwargs),
                "args": [str(job.id)],
            }
        celery_app.conf.beat_schedule = beat_schedule
    finally:
        db.close()
