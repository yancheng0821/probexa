import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@patch("app.api.tasks.run_scrape_task")
def test_create_task(mock_run, client):
    mock_run.delay = MagicMock()
    resp = client.post("/api/tasks", json={
        "keyword": "wireless earbuds",
        "platform": "tiktok",
        "max_items": 500,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["keyword"] == "wireless earbuds"
    assert data["platform"] == "tiktok"
    assert data["status"] == "pending"


def test_list_tasks(client):
    resp = client.get("/api/tasks")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_task_not_found(client):
    resp = client.get("/api/tasks/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
