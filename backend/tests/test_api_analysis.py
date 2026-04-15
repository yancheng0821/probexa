import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.models.scrape_task import ScrapeTask


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@patch("app.api.analysis.run_analysis_task")
def test_trigger_analysis(mock_run, client, db_session):
    mock_run.delay = MagicMock()
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="test", platform="tiktok", status="completed")
    db_session.add(task)
    db_session.commit()

    resp = client.post("/api/analysis", json={
        "task_id": str(task_id),
        "analysis_type": "pain_points",
    })
    assert resp.status_code == 202
    mock_run.delay.assert_called_once()


def test_list_analysis_empty(client):
    resp = client.get("/api/analysis")
    assert resp.status_code == 200
    assert resp.json() == []
