import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.models.analysis_result import AnalysisResult
from app.reports.generator import ReportGenerator


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_report_generator_markdown():
    gen = ReportGenerator()
    report = gen.generate_markdown(
        keyword="earbuds",
        analyses=[
            {
                "analysis_type": "pain_points",
                "summary": "Top: battery life",
                "details": {"pain_points": [{"issue": "battery", "frequency": 42}]},
            }
        ],
    )
    assert "earbuds" in report
    assert "battery" in report
    assert report.startswith("#")


def test_create_report(client, db_session):
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="earbuds", platform="tiktok", status="completed")
    db_session.add(task)
    a = AnalysisResult(
        id=uuid.uuid4(), task_id=task_id, analysis_type="pain_points",
        summary="Top: battery", model_used="gpt-4o-mini",
        details={"pain_points": [{"issue": "battery", "frequency": 42}]},
    )
    db_session.add(a)
    db_session.commit()

    resp = client.post("/api/reports", json={"task_id": str(task_id)})
    assert resp.status_code == 201
    assert "earbuds" in resp.json()["content"]
