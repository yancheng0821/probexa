import pytest
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


def test_create_schedule(client):
    resp = client.post("/api/schedules", json={
        "keyword": "wireless earbuds",
        "platform": "tiktok",
        "cron_expression": "0 8 * * *",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["keyword"] == "wireless earbuds"
    assert data["is_active"] is True


def test_list_schedules(client):
    resp = client.get("/api/schedules")
    assert resp.status_code == 200


def test_update_schedule(client):
    resp = client.post("/api/schedules", json={
        "keyword": "test", "platform": "tiktok", "cron_expression": "0 8 * * *",
    })
    schedule_id = resp.json()["id"]
    resp = client.put(f"/api/schedules/{schedule_id}", json={"is_active": False})
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


def test_delete_schedule(client):
    resp = client.post("/api/schedules", json={
        "keyword": "test", "platform": "tiktok", "cron_expression": "0 8 * * *",
    })
    schedule_id = resp.json()["id"]
    resp = client.delete(f"/api/schedules/{schedule_id}")
    assert resp.status_code == 204
