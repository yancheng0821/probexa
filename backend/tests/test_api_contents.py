import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.models.content import Content


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_content(db_session):
    task_id = uuid.uuid4()
    task = ScrapeTask(id=task_id, keyword="test", platform="tiktok", status="completed")
    db_session.add(task)
    content = Content(
        id=uuid.uuid4(),
        task_id=task_id,
        platform="tiktok",
        source_id="vid_001",
        content_type="video",
        title="Test video",
        body="Great product",
        author="user1",
        url="https://tiktok.com/vid_001",
        metrics={"views": 1000},
    )
    db_session.add(content)
    db_session.commit()
    return content


def test_list_contents_empty(client):
    resp = client.get("/api/contents")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_contents_with_data(client, seeded_content):
    resp = client.get("/api/contents")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["source_id"] == "vid_001"


def test_get_content_by_id(client, seeded_content):
    resp = client.get(f"/api/contents/{seeded_content.id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test video"
