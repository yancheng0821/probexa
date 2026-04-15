import uuid

from app.models.scrape_task import ScrapeTask
from app.models.content import Content
from app.models.analysis_result import AnalysisResult
from app.models.scheduled_job import ScheduledJob


def test_create_scrape_task(db_session):
    task = ScrapeTask(
        id=uuid.uuid4(),
        keyword="wireless earbuds",
        platform="tiktok",
        status="pending",
    )
    db_session.add(task)
    db_session.commit()

    result = db_session.query(ScrapeTask).first()
    assert result.keyword == "wireless earbuds"
    assert result.platform == "tiktok"
    assert result.status == "pending"


def test_create_content(db_session):
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="test", platform="tiktok", status="completed")
    db_session.add(task)
    db_session.commit()

    content = Content(
        id=uuid.uuid4(),
        task_id=task_id,
        platform="tiktok",
        source_id="tiktok_123",
        content_type="video",
        title="Best earbuds 2026",
        body="Amazing sound quality",
        author="user1",
        url="https://tiktok.com/123",
        metrics={"views": 10000, "likes": 500},
    )
    db_session.add(content)
    db_session.commit()

    result = db_session.query(Content).first()
    assert result.source_id == "tiktok_123"
    assert result.metrics["views"] == 10000


def test_create_analysis_result(db_session):
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="test", platform="tiktok", status="completed")
    db_session.add(task)
    db_session.commit()

    analysis = AnalysisResult(
        id=uuid.uuid4(),
        task_id=task_id,
        analysis_type="pain_points",
        summary="Users complain about battery life",
        details={"pain_points": [{"issue": "battery", "frequency": 42}]},
        model_used="gpt-4o-mini",
        token_usage={"prompt_tokens": 1000, "completion_tokens": 500},
    )
    db_session.add(analysis)
    db_session.commit()

    result = db_session.query(AnalysisResult).first()
    assert result.analysis_type == "pain_points"
    assert result.details["pain_points"][0]["issue"] == "battery"


def test_create_scheduled_job(db_session):
    job = ScheduledJob(
        id=uuid.uuid4(),
        keyword="wireless earbuds",
        platform="tiktok",
        cron_expression="0 8 * * *",
        is_active=True,
    )
    db_session.add(job)
    db_session.commit()

    result = db_session.query(ScheduledJob).first()
    assert result.cron_expression == "0 8 * * *"
    assert result.is_active is True
