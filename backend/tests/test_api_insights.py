import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.models.analysis_result import AnalysisResult


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_analysis(db_session):
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="earbuds", platform="tiktok", status="completed")
    db_session.add(task)
    db_session.commit()

    a1 = AnalysisResult(
        id=uuid.uuid4(), task_id=task_id, analysis_type="trends",
        summary="Rising: ANC earbuds", model_used="gpt-4o-mini",
        details={"trends": [{"topic": "ANC", "momentum": "rising", "engagement_score": 85}]},
    )
    a2 = AnalysisResult(
        id=uuid.uuid4(), task_id=task_id, analysis_type="pain_points",
        summary="Top: battery life", model_used="gpt-4o-mini",
        details={"pain_points": [{"issue": "battery", "frequency": 42, "severity": 8}]},
    )
    a3 = AnalysisResult(
        id=uuid.uuid4(), task_id=task_id, analysis_type="unmet_needs",
        summary="Need: better fit", model_used="gpt-4o-mini",
        details={"unmet_needs": [{"need": "custom fit", "mentions": 15, "market_potential": "high"}]},
    )
    db_session.add_all([a1, a2, a3])
    db_session.commit()


def test_get_trends(client, seeded_analysis):
    resp = client.get("/api/insights/trends")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_get_pain_points(client, seeded_analysis):
    resp = client.get("/api/insights/pain-points")
    assert resp.status_code == 200


def test_get_needs(client, seeded_analysis):
    resp = client.get("/api/insights/needs")
    assert resp.status_code == 200
