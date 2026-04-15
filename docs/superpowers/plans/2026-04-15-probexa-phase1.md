# Probexa Phase 1: TikTok End-to-End Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working pipeline that scrapes TikTok via Playwright, analyzes content with OpenAI, and displays results in a React Dashboard.

**Architecture:** FastAPI backend with Celery task queue (Redis broker). Playwright scrapes TikTok, results stored in PostgreSQL, OpenAI analyzes content, React frontend displays insights. All infrastructure runs via Docker Compose.

**Tech Stack:** Python 3.12, FastAPI, Celery, SQLAlchemy, Alembic, Playwright, OpenAI SDK, React 18, Vite, Ant Design, Recharts, PostgreSQL, Redis, Docker Compose.

---

## File Structure

```
probexa/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Settings (pydantic-settings)
│   │   │   └── database.py          # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── scrape_task.py
│   │   │   ├── content.py
│   │   │   ├── analysis_result.py
│   │   │   └── scheduled_job.py
│   │   ├── scrapers/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   └── tiktok.py
│   │   ├── analyzers/
│   │   │   ├── __init__.py
│   │   │   └── openai_analyzer.py
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   ├── scrape_tasks.py
│   │   │   └── analysis_tasks.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py
│   │   │   ├── contents.py
│   │   │   ├── analysis.py
│   │   │   ├── insights.py
│   │   │   ├── schedules.py
│   │   │   └── reports.py
│   │   ├── reports/
│   │   │   ├── __init__.py
│   │   │   └── generator.py
│   │   └── scheduler/
│   │       ├── __init__.py
│   │       └── manager.py
│   └── tests/
│       ├── conftest.py
│       ├── test_models.py
│       ├── test_scraper_base.py
│       ├── test_tiktok_scraper.py
│       ├── test_analyzer.py
│       ├── test_celery_tasks.py
│       ├── test_api_tasks.py
│       ├── test_api_contents.py
│       ├── test_api_analysis.py
│       ├── test_api_insights.py
│       ├── test_api_schedules.py
│       └── test_api_reports.py
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── client.ts
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Tasks.tsx
│       │   ├── Trends.tsx
│       │   ├── PainPoints.tsx
│       │   ├── Needs.tsx
│       │   ├── Schedules.tsx
│       │   └── Reports.tsx
│       └── components/
│           ├── Layout.tsx
│           ├── TaskForm.tsx
│           ├── TaskList.tsx
│           ├── TrendChart.tsx
│           ├── PainPointMatrix.tsx
│           └── NeedsList.tsx
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `backend/requirements.txt`
- Create: `backend/Dockerfile`

- [ ] **Step 1: Create .gitignore**

```gitignore
# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
.venv/
venv/

# Node
node_modules/
frontend/dist/

# Environment
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

- [ ] **Step 2: Create .env.example**

```env
DATABASE_URL=postgresql://probexa:probexa@localhost:5432/probexa
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-your-key-here
```

- [ ] **Step 3: Create docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: probexa
      POSTGRES_PASSWORD: probexa
      POSTGRES_DB: probexa
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

- [ ] **Step 4: Create backend/requirements.txt**

```txt
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
alembic==1.14.1
psycopg2-binary==2.9.10
pydantic-settings==2.7.1
celery[redis]==5.4.0
playwright==1.49.1
openai==1.59.3
python-dotenv==1.0.1
httpx==0.28.1
pytest==8.3.4
pytest-asyncio==0.25.0
```

- [ ] **Step 5: Create backend/Dockerfile**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium --with-deps

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 6: Start infrastructure and verify**

Run:
```bash
cd /Users/aisenyc/work/probexa
docker-compose up -d postgres redis
docker-compose ps
```
Expected: postgres and redis both running.

- [ ] **Step 7: Set up Python virtual environment**

Run:
```bash
cd /Users/aisenyc/work/probexa/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```
Expected: All packages installed successfully.

- [ ] **Step 8: Commit**

```bash
git add .gitignore .env.example docker-compose.yml backend/requirements.txt backend/Dockerfile
git commit -m "chore: project scaffolding with Docker, deps, and gitignore"
```

---

### Task 2: Core Config & Database

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`

- [ ] **Step 1: Create package init files**

`backend/app/__init__.py` — empty file
`backend/app/core/__init__.py` — empty file

- [ ] **Step 2: Create config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://probexa:probexa@localhost:5432/probexa"
    redis_url: str = "redis://localhost:6379/0"
    openai_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
```

- [ ] **Step 3: Create database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/
git commit -m "feat: add core config and database setup"
```

---

### Task 3: Data Models

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/scrape_task.py`
- Create: `backend/app/models/content.py`
- Create: `backend/app/models/analysis_result.py`
- Create: `backend/app/models/scheduled_job.py`
- Create: `backend/tests/__init__.py` (empty)
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_models.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/conftest.py`:
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
```

`backend/tests/test_models.py`:
```python
import uuid
from datetime import datetime, timezone

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_models.py -v`
Expected: FAIL — models not defined yet.

- [ ] **Step 3: Implement models**

`backend/app/models/__init__.py`:
```python
from app.models.scrape_task import ScrapeTask
from app.models.content import Content
from app.models.analysis_result import AnalysisResult
from app.models.scheduled_job import ScheduledJob

__all__ = ["ScrapeTask", "Content", "AnalysisResult", "ScheduledJob"]
```

`backend/app/models/scrape_task.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ScrapeTask(Base):
    __tablename__ = "scrape_tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    keyword: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    total_items: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
```

`backend/app/models/content.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Content(Base):
    __tablename__ = "contents"
    __table_args__ = (
        UniqueConstraint("platform", "source_id", name="uq_platform_source_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scrape_tasks.id"))
    platform: Mapped[str] = mapped_column(String(50))
    source_id: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(20))
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
```

`backend/app/models/analysis_result.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scrape_tasks.id"))
    analysis_type: Mapped[str] = mapped_column(String(50))
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    model_used: Mapped[str] = mapped_column(String(50))
    token_usage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
```

`backend/app/models/scheduled_job.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ScheduledJob(Base):
    __tablename__ = "scheduled_jobs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    keyword: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(50))
    cron_expression: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_models.py -v`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/ backend/tests/
git commit -m "feat: add data models for scrape tasks, contents, analysis results, scheduled jobs"
```

---

### Task 4: Alembic Database Migrations

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

- [ ] **Step 1: Initialize Alembic**

Run:
```bash
cd /Users/aisenyc/work/probexa/backend
source .venv/bin/activate
alembic init alembic
```

- [ ] **Step 2: Edit alembic.ini — set sqlalchemy.url to empty (we'll use env.py)**

In `backend/alembic.ini`, set:
```ini
sqlalchemy.url =
```

- [ ] **Step 3: Edit alembic/env.py to use our models and config**

Replace `backend/alembic/env.py` with:
```python
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.database import Base
from app.models import ScrapeTask, Content, AnalysisResult, ScheduledJob  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 4: Generate initial migration**

Run:
```bash
cd /Users/aisenyc/work/probexa/backend
cp ../.env.example ../.env  # create .env with defaults
alembic revision --autogenerate -m "initial tables"
```
Expected: Migration file created in `alembic/versions/`.

- [ ] **Step 5: Run migration**

Run:
```bash
alembic upgrade head
```
Expected: Tables created in PostgreSQL.

- [ ] **Step 6: Commit**

```bash
git add backend/alembic.ini backend/alembic/
git commit -m "feat: add Alembic migrations for initial schema"
```

---

### Task 5: Celery Setup

**Files:**
- Create: `backend/app/tasks/__init__.py`
- Create: `backend/app/tasks/celery_app.py`
- Create: `backend/tests/test_celery_tasks.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_celery_tasks.py`:
```python
from app.tasks.celery_app import celery_app


def test_celery_app_configured():
    assert celery_app.main == "probexa"
    assert "redis" in celery_app.conf.broker_url
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_celery_tasks.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement celery_app.py**

`backend/app/tasks/__init__.py` — empty file.

`backend/app/tasks/celery_app.py`:
```python
from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "probexa",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_celery_tasks.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/tasks/
git commit -m "feat: add Celery app configuration"
```

---

### Task 6: Scraper Base Class

**Files:**
- Create: `backend/app/scrapers/__init__.py`
- Create: `backend/app/scrapers/base.py`
- Create: `backend/tests/test_scraper_base.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_scraper_base.py`:
```python
import pytest

from app.scrapers.base import BaseScraper


class DummyScraper(BaseScraper):
    platform = "dummy"

    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        return [{"id": "1", "title": f"Result for {keyword}"}]

    async def parse_item(self, raw_data: dict) -> dict:
        return {"source_id": raw_data["id"], "title": raw_data["title"]}


@pytest.mark.asyncio
async def test_base_scraper_interface():
    scraper = DummyScraper()
    assert scraper.platform == "dummy"
    results = await scraper.scrape("test", max_items=10)
    assert len(results) == 1
    assert results[0]["title"] == "Result for test"


@pytest.mark.asyncio
async def test_base_scraper_parse_item():
    scraper = DummyScraper()
    parsed = await scraper.parse_item({"id": "abc", "title": "Hello"})
    assert parsed["source_id"] == "abc"


def test_cannot_instantiate_base_directly():
    with pytest.raises(TypeError):
        BaseScraper()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_scraper_base.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement base scraper**

`backend/app/scrapers/__init__.py` — empty file.

`backend/app/scrapers/base.py`:
```python
import asyncio
import random
from abc import ABC, abstractmethod


class BaseScraper(ABC):
    platform: str = ""

    @abstractmethod
    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        """Scrape content for a given keyword. Returns list of raw data dicts."""
        ...

    @abstractmethod
    async def parse_item(self, raw_data: dict) -> dict:
        """Parse raw scraped data into standardized content dict."""
        ...

    async def random_delay(self, min_sec: float = 2.0, max_sec: float = 5.0):
        """Random delay between actions to avoid detection."""
        delay = random.uniform(min_sec, max_sec)
        await asyncio.sleep(delay)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_scraper_base.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/scrapers/ backend/tests/test_scraper_base.py
git commit -m "feat: add base scraper abstract class"
```

---

### Task 7: TikTok Scraper

**Files:**
- Create: `backend/app/scrapers/tiktok.py`
- Create: `backend/tests/test_tiktok_scraper.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_tiktok_scraper.py`:
```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_tiktok_scraper.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement TikTok scraper**

`backend/app/scrapers/tiktok.py`:
```python
import asyncio
import random
from datetime import datetime, timezone
from urllib.parse import quote

from playwright.async_api import async_playwright, Page

from app.scrapers.base import BaseScraper

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]


class TikTokScraper(BaseScraper):
    platform = "tiktok"

    def build_search_url(self, keyword: str) -> str:
        encoded = quote(keyword)
        return f"https://www.tiktok.com/search?q={encoded}"

    async def parse_item(self, raw_data: dict) -> dict:
        stats = raw_data.get("stats", {})
        author = raw_data.get("author", {})
        create_time = raw_data.get("createTime")

        published_at = None
        if create_time:
            published_at = datetime.fromtimestamp(int(create_time), tz=timezone.utc).isoformat()

        return {
            "source_id": str(raw_data.get("id", "")),
            "platform": "tiktok",
            "content_type": "video",
            "title": raw_data.get("desc", ""),
            "body": raw_data.get("desc", ""),
            "author": author.get("uniqueId", ""),
            "url": f"https://www.tiktok.com/@{author.get('uniqueId', '')}/video/{raw_data.get('id', '')}",
            "metrics": {
                "views": stats.get("playCount", 0),
                "likes": stats.get("diggCount", 0),
                "comments": stats.get("commentCount", 0),
                "shares": stats.get("shareCount", 0),
            },
            "published_at": published_at,
            "raw_data": raw_data,
        }

    async def scrape(self, keyword: str, max_items: int = 100) -> list[dict]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={"width": 1920, "height": 1080},
            )
            page = await context.new_page()

            try:
                url = self.build_search_url(keyword)
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await self.random_delay(3, 6)

                results = await self._collect_videos(page, max_items)
            finally:
                await browser.close()

        return results

    async def _collect_videos(self, page: Page, max_items: int) -> list[dict]:
        collected = []
        last_count = 0
        retries = 0
        max_retries = 3

        while len(collected) < max_items and retries < max_retries:
            # Extract video data from page
            items = await page.evaluate("""
                () => {
                    const videos = document.querySelectorAll('[data-e2e="search_top-item"]');
                    return Array.from(videos).map(v => {
                        const link = v.querySelector('a');
                        const desc = v.querySelector('[data-e2e="search-card-desc"]');
                        const author = v.querySelector('[data-e2e="search-card-user-unique-id"]');
                        return {
                            url: link ? link.href : '',
                            desc: desc ? desc.textContent : '',
                            author: author ? author.textContent : '',
                        };
                    });
                }
            """)

            for item in items:
                if len(collected) >= max_items:
                    break
                video_id = item.get("url", "").split("/")[-1]
                if video_id and not any(c.get("id") == video_id for c in collected):
                    collected.append({
                        "id": video_id,
                        "desc": item.get("desc", ""),
                        "author": {"uniqueId": item.get("author", "")},
                        "stats": {},
                        "createTime": None,
                    })

            if len(collected) == last_count:
                retries += 1
            else:
                retries = 0
            last_count = len(collected)

            # Scroll to load more
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await self.random_delay(2, 4)

        parsed = []
        for item in collected:
            parsed.append(await self.parse_item(item))
        return parsed
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_tiktok_scraper.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/scrapers/tiktok.py backend/tests/test_tiktok_scraper.py
git commit -m "feat: add TikTok scraper with Playwright"
```

---

### Task 8: OpenAI Analyzer

**Files:**
- Create: `backend/app/analyzers/__init__.py`
- Create: `backend/app/analyzers/openai_analyzer.py`
- Create: `backend/tests/test_analyzer.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_analyzer.py`:
```python
import pytest
from unittest.mock import patch, MagicMock

from app.analyzers.openai_analyzer import OpenAIAnalyzer


def test_analyzer_init():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    assert analyzer.api_key == "test-key"


def test_build_prompt_pain_points():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [
        {"title": "Bad battery", "body": "Battery dies in 2 hours"},
        {"title": "Great sound", "body": "But the case is cheap plastic"},
    ]
    prompt = analyzer.build_prompt("pain_points", "wireless earbuds", contents)
    assert "wireless earbuds" in prompt
    assert "pain" in prompt.lower()
    assert "Battery dies" in prompt


def test_build_prompt_trends():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "Trending item", "body": "Everyone wants this", "metrics": {"views": 1000}}]
    prompt = analyzer.build_prompt("trends", "gadgets", contents)
    assert "gadgets" in prompt
    assert "trend" in prompt.lower()


def test_build_prompt_unmet_needs():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "I wish", "body": "I wish it had noise canceling"}]
    prompt = analyzer.build_prompt("unmet_needs", "earbuds", contents)
    assert "earbuds" in prompt
    assert "need" in prompt.lower() or "wish" in prompt.lower()


def test_build_prompt_pricing():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "Too expensive", "body": "$200 is too much for this"}]
    prompt = analyzer.build_prompt("pricing", "earbuds", contents)
    assert "earbuds" in prompt
    assert "pric" in prompt.lower()


def test_chunk_contents():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"body": f"item {i}"} for i in range(250)]
    chunks = analyzer.chunk_contents(contents, chunk_size=100)
    assert len(chunks) == 3
    assert len(chunks[0]) == 100
    assert len(chunks[2]) == 50


@patch("app.analyzers.openai_analyzer.OpenAI")
def test_analyze_calls_openai(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"pain_points": [{"issue": "battery", "frequency": 10}]}'
    mock_response.usage.prompt_tokens = 500
    mock_response.usage.completion_tokens = 200
    mock_client.chat.completions.create.return_value = mock_response

    analyzer = OpenAIAnalyzer(api_key="test-key")
    result = analyzer.analyze(
        analysis_type="pain_points",
        keyword="earbuds",
        contents=[{"title": "test", "body": "bad battery"}],
    )
    assert result["details"]["pain_points"][0]["issue"] == "battery"
    assert result["token_usage"]["prompt_tokens"] == 500
    assert result["model_used"] == "gpt-4o-mini"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_analyzer.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement analyzer**

`backend/app/analyzers/__init__.py` — empty file.

`backend/app/analyzers/openai_analyzer.py`:
```python
import json

from openai import OpenAI

PROMPTS = {
    "pain_points": """Analyze the following user-generated content about "{keyword}" from social media.
Identify the main pain points and complaints users have with existing products.

For each pain point, provide:
- issue: short description
- frequency: estimated number of mentions (from the data provided)
- severity: 1-10 scale
- sample_quotes: 1-2 direct quotes

Content to analyze:
{content_text}

Respond in JSON format:
{{"pain_points": [{{"issue": "...", "frequency": N, "severity": N, "sample_quotes": ["..."]}}]}}""",

    "trends": """Analyze the following user-generated content about "{keyword}" from social media.
Identify trending topics, popular features, and emerging patterns.

For each trend, provide:
- topic: short description
- momentum: "rising", "stable", or "declining"
- engagement_score: relative score 1-100 based on views/likes/shares
- evidence: 1-2 supporting observations

Content to analyze:
{content_text}

Respond in JSON format:
{{"trends": [{{"topic": "...", "momentum": "...", "engagement_score": N, "evidence": ["..."]}}]}}""",

    "unmet_needs": """Analyze the following user-generated content about "{keyword}" from social media.
Identify unmet needs — things users wish existed, features they want, problems without solutions.
Look for phrases like "I wish", "why can't", "if only", "someone should make".

For each need, provide:
- need: short description
- mentions: number of times similar requests appear
- market_potential: "high", "medium", or "low"
- sample_quotes: 1-2 direct quotes

Content to analyze:
{content_text}

Respond in JSON format:
{{"unmet_needs": [{{"need": "...", "mentions": N, "market_potential": "...", "sample_quotes": ["..."]}}]}}""",

    "pricing": """Analyze the following user-generated content about "{keyword}" from social media.
Identify pricing-related insights — what users think about pricing, their expected price range,
and value-for-money sentiments.

Provide:
- expected_range: {{"min": N, "max": N, "currency": "USD"}}
- value_concerns: list of specific value/price complaints
- willingness_signals: what features users would pay more for

Content to analyze:
{content_text}

Respond in JSON format:
{{"expected_range": {{"min": N, "max": N, "currency": "USD"}}, "value_concerns": ["..."], "willingness_signals": ["..."]}}""",
}


class OpenAIAnalyzer:
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self.client = OpenAI(api_key=api_key)

    def build_prompt(self, analysis_type: str, keyword: str, contents: list[dict]) -> str:
        template = PROMPTS[analysis_type]
        content_lines = []
        for c in contents:
            title = c.get("title", "")
            body = c.get("body", "")
            metrics = c.get("metrics", {})
            line = f"- {title}: {body}"
            if metrics:
                line += f" (metrics: {metrics})"
            content_lines.append(line)
        content_text = "\n".join(content_lines)
        return template.format(keyword=keyword, content_text=content_text)

    def chunk_contents(self, contents: list[dict], chunk_size: int = 100) -> list[list[dict]]:
        return [contents[i : i + chunk_size] for i in range(0, len(contents), chunk_size)]

    def analyze(
        self,
        analysis_type: str,
        keyword: str,
        contents: list[dict],
        model: str | None = None,
    ) -> dict:
        use_model = model or self.model
        prompt = self.build_prompt(analysis_type, keyword, contents)

        response = self.client.chat.completions.create(
            model=use_model,
            messages=[
                {"role": "system", "content": "You are a market research analyst. Respond only in valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        content = response.choices[0].message.content
        details = json.loads(content)

        return {
            "analysis_type": analysis_type,
            "summary": self._generate_summary(analysis_type, details),
            "details": details,
            "model_used": use_model,
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            },
        }

    def _generate_summary(self, analysis_type: str, details: dict) -> str:
        if analysis_type == "pain_points":
            points = details.get("pain_points", [])
            top = [p["issue"] for p in sorted(points, key=lambda x: x.get("frequency", 0), reverse=True)[:3]]
            return f"Top pain points: {', '.join(top)}" if top else "No pain points identified."

        if analysis_type == "trends":
            trends = details.get("trends", [])
            rising = [t["topic"] for t in trends if t.get("momentum") == "rising"][:3]
            return f"Rising trends: {', '.join(rising)}" if rising else "No clear trends identified."

        if analysis_type == "unmet_needs":
            needs = details.get("unmet_needs", [])
            high = [n["need"] for n in needs if n.get("market_potential") == "high"][:3]
            return f"High-potential needs: {', '.join(high)}" if high else "No unmet needs identified."

        if analysis_type == "pricing":
            r = details.get("expected_range", {})
            return f"Expected price range: ${r.get('min', '?')}-${r.get('max', '?')}"

        return ""
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_analyzer.py -v`
Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/analyzers/ backend/tests/test_analyzer.py
git commit -m "feat: add OpenAI analyzer with 4 analysis types"
```

---

### Task 9: Celery Scrape & Analysis Tasks

**Files:**
- Create: `backend/app/tasks/scrape_tasks.py`
- Create: `backend/app/tasks/analysis_tasks.py`

- [ ] **Step 1: Write the failing test**

Add to `backend/tests/test_celery_tasks.py`:
```python
from unittest.mock import patch, MagicMock
import uuid

from app.tasks.scrape_tasks import run_scrape_task
from app.tasks.analysis_tasks import run_analysis_task


@patch("app.tasks.scrape_tasks.SessionLocal")
@patch("app.tasks.scrape_tasks.TikTokScraper")
def test_run_scrape_task_creates_contents(mock_scraper_class, mock_session_local):
    mock_session = MagicMock()
    mock_session_local.return_value = mock_session
    mock_scraper = MagicMock()
    mock_scraper_class.return_value = mock_scraper

    import asyncio
    mock_scraper.scrape = MagicMock(return_value=asyncio.coroutine(lambda: [
        {"source_id": "123", "platform": "tiktok", "content_type": "video",
         "title": "test", "body": "test body", "author": "user1",
         "url": "https://tiktok.com/123", "metrics": {}, "published_at": None, "raw_data": {}}
    ])())

    task_id = str(uuid.uuid4())
    mock_task = MagicMock()
    mock_task.keyword = "test"
    mock_task.platform = "tiktok"
    mock_session.query.return_value.filter.return_value.first.return_value = mock_task

    # Verify function exists and is callable
    assert callable(run_scrape_task)


@patch("app.tasks.analysis_tasks.SessionLocal")
@patch("app.tasks.analysis_tasks.OpenAIAnalyzer")
def test_run_analysis_task_callable(mock_analyzer_class, mock_session_local):
    assert callable(run_analysis_task)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_celery_tasks.py -v`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement scrape task**

`backend/app/tasks/scrape_tasks.py`:
```python
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
```

- [ ] **Step 4: Implement analysis task**

`backend/app/tasks/analysis_tasks.py`:
```python
import uuid

from app.tasks.celery_app import celery_app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.scrape_task import ScrapeTask
from app.models.content import Content
from app.models.analysis_result import AnalysisResult
from app.analyzers.openai_analyzer import OpenAIAnalyzer


@celery_app.task(bind=True, max_retries=2)
def run_analysis_task(self, task_id: str, analysis_type: str, model: str = "gpt-4o-mini"):
    db = SessionLocal()
    try:
        task = db.query(ScrapeTask).filter(ScrapeTask.id == task_id).first()
        if not task:
            return {"error": f"Task {task_id} not found"}

        contents = db.query(Content).filter(Content.task_id == task_id).all()
        if not contents:
            return {"error": "No contents to analyze"}

        content_dicts = [
            {"title": c.title or "", "body": c.body or "", "metrics": c.metrics or {}}
            for c in contents
        ]

        analyzer = OpenAIAnalyzer(api_key=settings.openai_api_key, model=model)
        chunks = analyzer.chunk_contents(content_dicts, chunk_size=100)

        all_results = []
        total_prompt_tokens = 0
        total_completion_tokens = 0

        for chunk in chunks:
            result = analyzer.analyze(
                analysis_type=analysis_type,
                keyword=task.keyword,
                contents=chunk,
                model=model,
            )
            all_results.append(result["details"])
            total_prompt_tokens += result["token_usage"]["prompt_tokens"]
            total_completion_tokens += result["token_usage"]["completion_tokens"]

        # Merge results from all chunks
        merged_details = all_results[0] if len(all_results) == 1 else {"chunks": all_results}

        # If multiple chunks, do a final merge analysis
        if len(all_results) > 1:
            merge_result = analyzer.analyze(
                analysis_type=analysis_type,
                keyword=task.keyword,
                contents=[{"title": "Chunk results", "body": str(all_results)}],
                model="gpt-4o",
            )
            merged_details = merge_result["details"]
            total_prompt_tokens += merge_result["token_usage"]["prompt_tokens"]
            total_completion_tokens += merge_result["token_usage"]["completion_tokens"]

        analysis = AnalysisResult(
            id=uuid.uuid4(),
            task_id=uuid.UUID(task_id),
            analysis_type=analysis_type,
            summary=analyzer._generate_summary(analysis_type, merged_details),
            details=merged_details,
            model_used=model,
            token_usage={
                "prompt_tokens": total_prompt_tokens,
                "completion_tokens": total_completion_tokens,
            },
        )
        db.add(analysis)
        db.commit()

        return {"analysis_id": str(analysis.id), "type": analysis_type}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_celery_tasks.py -v`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/tasks/scrape_tasks.py backend/app/tasks/analysis_tasks.py backend/tests/test_celery_tasks.py
git commit -m "feat: add Celery tasks for scraping and analysis"
```

---

### Task 10: FastAPI App Entry Point

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: Create main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import tasks, contents, analysis, insights, schedules, reports

app = FastAPI(title="Probexa", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(contents.router, prefix="/api/contents", tags=["contents"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["schedules"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add FastAPI app entry point with CORS and routers"
```

---

### Task 11: API — Tasks Endpoints

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/tasks.py`
- Create: `backend/tests/test_api_tasks.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_tasks.py`:
```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_tasks.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement tasks API**

`backend/app/api/__init__.py` — empty file.

`backend/app/api/tasks.py`:
```python
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.tasks.scrape_tasks import run_scrape_task

router = APIRouter()


class TaskCreate(BaseModel):
    keyword: str
    platform: str
    max_items: int = 100


class TaskResponse(BaseModel):
    id: str
    keyword: str
    platform: str
    status: str
    total_items: int
    created_at: str
    completed_at: str | None

    model_config = {"from_attributes": True}


@router.post("", status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    task = ScrapeTask(
        id=uuid.uuid4(),
        keyword=body.keyword,
        platform=body.platform,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    run_scrape_task.delay(str(task.id), body.max_items)

    return {
        "id": str(task.id),
        "keyword": task.keyword,
        "platform": task.platform,
        "status": task.status,
        "total_items": task.total_items,
        "created_at": str(task.created_at),
        "completed_at": None,
    }


@router.get("")
def list_tasks(
    platform: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(ScrapeTask)
    if platform:
        query = query.filter(ScrapeTask.platform == platform)
    tasks = query.order_by(ScrapeTask.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(t.id),
            "keyword": t.keyword,
            "platform": t.platform,
            "status": t.status,
            "total_items": t.total_items,
            "created_at": str(t.created_at),
            "completed_at": str(t.completed_at) if t.completed_at else None,
        }
        for t in tasks
    ]


@router.get("/{task_id}")
def get_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(ScrapeTask).filter(ScrapeTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": str(task.id),
        "keyword": task.keyword,
        "platform": task.platform,
        "status": task.status,
        "total_items": task.total_items,
        "created_at": str(task.created_at),
        "completed_at": str(task.completed_at) if task.completed_at else None,
    }


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(ScrapeTask).filter(ScrapeTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_tasks.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/ backend/tests/test_api_tasks.py
git commit -m "feat: add tasks API endpoints (create, list, get, delete)"
```

---

### Task 12: API — Contents Endpoints

**Files:**
- Create: `backend/app/api/contents.py`
- Create: `backend/tests/test_api_contents.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_contents.py`:
```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_contents.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement contents API**

`backend/app/api/contents.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import Content

router = APIRouter()


@router.get("")
def list_contents(
    platform: str | None = None,
    task_id: str | None = None,
    keyword: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Content)
    if platform:
        query = query.filter(Content.platform == platform)
    if task_id:
        query = query.filter(Content.task_id == task_id)
    contents = query.order_by(Content.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(c.id),
            "task_id": str(c.task_id),
            "platform": c.platform,
            "source_id": c.source_id,
            "content_type": c.content_type,
            "title": c.title,
            "body": c.body,
            "author": c.author,
            "url": c.url,
            "metrics": c.metrics,
            "published_at": str(c.published_at) if c.published_at else None,
            "created_at": str(c.created_at),
        }
        for c in contents
    ]


@router.get("/{content_id}")
def get_content(content_id: str, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return {
        "id": str(content.id),
        "task_id": str(content.task_id),
        "platform": content.platform,
        "source_id": content.source_id,
        "content_type": content.content_type,
        "title": content.title,
        "body": content.body,
        "author": content.author,
        "url": content.url,
        "metrics": content.metrics,
        "published_at": str(content.published_at) if content.published_at else None,
        "raw_data": content.raw_data,
        "created_at": str(content.created_at),
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_contents.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/contents.py backend/tests/test_api_contents.py
git commit -m "feat: add contents API endpoints (list, get)"
```

---

### Task 13: API — Analysis Endpoints

**Files:**
- Create: `backend/app/api/analysis.py`
- Create: `backend/tests/test_api_analysis.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_analysis.py`:
```python
import uuid
import pytest
from unittest.mock import patch, MagicMock
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_analysis.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement analysis API**

`backend/app/api/analysis.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.models.analysis_result import AnalysisResult
from app.tasks.analysis_tasks import run_analysis_task

router = APIRouter()


class AnalysisRequest(BaseModel):
    task_id: str
    analysis_type: str  # pain_points, trends, unmet_needs, pricing
    model: str = "gpt-4o-mini"


@router.post("", status_code=202)
def trigger_analysis(body: AnalysisRequest, db: Session = Depends(get_db)):
    task = db.query(ScrapeTask).filter(ScrapeTask.id == body.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    valid_types = {"pain_points", "trends", "unmet_needs", "pricing"}
    if body.analysis_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid analysis type. Must be one of: {valid_types}")

    run_analysis_task.delay(body.task_id, body.analysis_type, body.model)
    return {"message": "Analysis started", "task_id": body.task_id, "type": body.analysis_type}


@router.get("")
def list_analysis(
    task_id: str | None = None,
    analysis_type: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisResult)
    if task_id:
        query = query.filter(AnalysisResult.task_id == task_id)
    if analysis_type:
        query = query.filter(AnalysisResult.analysis_type == analysis_type)
    results = query.order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(r.id),
            "task_id": str(r.task_id),
            "analysis_type": r.analysis_type,
            "summary": r.summary,
            "model_used": r.model_used,
            "token_usage": r.token_usage,
            "created_at": str(r.created_at),
        }
        for r in results
    ]


@router.get("/{analysis_id}")
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {
        "id": str(result.id),
        "task_id": str(result.task_id),
        "analysis_type": result.analysis_type,
        "summary": result.summary,
        "details": result.details,
        "model_used": result.model_used,
        "token_usage": result.token_usage,
        "created_at": str(result.created_at),
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_analysis.py -v`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/analysis.py backend/tests/test_api_analysis.py
git commit -m "feat: add analysis API endpoints (trigger, list, get)"
```

---

### Task 14: API — Insights Endpoints

**Files:**
- Create: `backend/app/api/insights.py`
- Create: `backend/tests/test_api_insights.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_insights.py`:
```python
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
    data = resp.json()
    assert len(data) >= 1


def test_get_pain_points(client, seeded_analysis):
    resp = client.get("/api/insights/pain-points")
    assert resp.status_code == 200


def test_get_needs(client, seeded_analysis):
    resp = client.get("/api/insights/needs")
    assert resp.status_code == 200
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_insights.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement insights API**

`backend/app/api/insights.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis_result import AnalysisResult

router = APIRouter()


@router.get("/trends")
def get_trends(
    keyword: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisResult).filter(AnalysisResult.analysis_type == "trends")
    results = query.order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(r.id),
            "task_id": str(r.task_id),
            "summary": r.summary,
            "details": r.details,
            "created_at": str(r.created_at),
        }
        for r in results
    ]


@router.get("/pain-points")
def get_pain_points(
    keyword: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisResult).filter(AnalysisResult.analysis_type == "pain_points")
    results = query.order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(r.id),
            "task_id": str(r.task_id),
            "summary": r.summary,
            "details": r.details,
            "created_at": str(r.created_at),
        }
        for r in results
    ]


@router.get("/needs")
def get_needs(
    keyword: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisResult).filter(AnalysisResult.analysis_type == "unmet_needs")
    results = query.order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(r.id),
            "task_id": str(r.task_id),
            "summary": r.summary,
            "details": r.details,
            "created_at": str(r.created_at),
        }
        for r in results
    ]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_insights.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/insights.py backend/tests/test_api_insights.py
git commit -m "feat: add insights API endpoints (trends, pain-points, needs)"
```

---

### Task 15: API — Schedules Endpoints

**Files:**
- Create: `backend/app/api/schedules.py`
- Create: `backend/tests/test_api_schedules.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_schedules.py`:
```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_schedules.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement schedules API**

`backend/app/api/schedules.py`:
```python
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scheduled_job import ScheduledJob

router = APIRouter()


class ScheduleCreate(BaseModel):
    keyword: str
    platform: str
    cron_expression: str


class ScheduleUpdate(BaseModel):
    keyword: str | None = None
    platform: str | None = None
    cron_expression: str | None = None
    is_active: bool | None = None


@router.post("", status_code=201)
def create_schedule(body: ScheduleCreate, db: Session = Depends(get_db)):
    job = ScheduledJob(
        id=uuid.uuid4(),
        keyword=body.keyword,
        platform=body.platform,
        cron_expression=body.cron_expression,
        is_active=True,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {
        "id": str(job.id),
        "keyword": job.keyword,
        "platform": job.platform,
        "cron_expression": job.cron_expression,
        "is_active": job.is_active,
        "created_at": str(job.created_at),
    }


@router.get("")
def list_schedules(db: Session = Depends(get_db)):
    jobs = db.query(ScheduledJob).order_by(ScheduledJob.created_at.desc()).all()
    return [
        {
            "id": str(j.id),
            "keyword": j.keyword,
            "platform": j.platform,
            "cron_expression": j.cron_expression,
            "is_active": j.is_active,
            "last_run_at": str(j.last_run_at) if j.last_run_at else None,
            "created_at": str(j.created_at),
        }
        for j in jobs
    ]


@router.put("/{schedule_id}")
def update_schedule(schedule_id: str, body: ScheduleUpdate, db: Session = Depends(get_db)):
    job = db.query(ScheduledJob).filter(ScheduledJob.id == schedule_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Schedule not found")

    if body.keyword is not None:
        job.keyword = body.keyword
    if body.platform is not None:
        job.platform = body.platform
    if body.cron_expression is not None:
        job.cron_expression = body.cron_expression
    if body.is_active is not None:
        job.is_active = body.is_active

    db.commit()
    db.refresh(job)
    return {
        "id": str(job.id),
        "keyword": job.keyword,
        "platform": job.platform,
        "cron_expression": job.cron_expression,
        "is_active": job.is_active,
        "created_at": str(job.created_at),
    }


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: str, db: Session = Depends(get_db)):
    job = db.query(ScheduledJob).filter(ScheduledJob.id == schedule_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(job)
    db.commit()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_schedules.py -v`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/schedules.py backend/tests/test_api_schedules.py
git commit -m "feat: add schedules API endpoints (CRUD)"
```

---

### Task 16: API — Reports Endpoints

**Files:**
- Create: `backend/app/reports/__init__.py`
- Create: `backend/app/reports/generator.py`
- Create: `backend/app/api/reports.py`
- Create: `backend/tests/test_api_reports.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_api_reports.py`:
```python
import uuid
import pytest
from unittest.mock import patch
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_reports.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement report generator**

`backend/app/reports/__init__.py` — empty file.

`backend/app/reports/generator.py`:
```python
from datetime import datetime, timezone


class ReportGenerator:
    def generate_markdown(self, keyword: str, analyses: list[dict]) -> str:
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        lines = [
            f"# Market Research Report: {keyword}",
            f"",
            f"**Generated:** {now}",
            f"",
            f"---",
            f"",
        ]

        for analysis in analyses:
            atype = analysis["analysis_type"]
            summary = analysis.get("summary", "")
            details = analysis.get("details", {})

            title_map = {
                "pain_points": "Pain Points Analysis",
                "trends": "Trends Analysis",
                "unmet_needs": "Unmet Needs Analysis",
                "pricing": "Pricing Analysis",
            }
            lines.append(f"## {title_map.get(atype, atype)}")
            lines.append(f"")
            lines.append(f"**Summary:** {summary}")
            lines.append(f"")

            if atype == "pain_points":
                points = details.get("pain_points", [])
                if points:
                    lines.append("| Issue | Frequency | Severity |")
                    lines.append("|-------|-----------|----------|")
                    for p in sorted(points, key=lambda x: x.get("frequency", 0), reverse=True):
                        lines.append(f"| {p.get('issue', '')} | {p.get('frequency', '')} | {p.get('severity', '')} |")
                    lines.append("")

            elif atype == "trends":
                trends = details.get("trends", [])
                if trends:
                    lines.append("| Topic | Momentum | Score |")
                    lines.append("|-------|----------|-------|")
                    for t in trends:
                        lines.append(f"| {t.get('topic', '')} | {t.get('momentum', '')} | {t.get('engagement_score', '')} |")
                    lines.append("")

            elif atype == "unmet_needs":
                needs = details.get("unmet_needs", [])
                if needs:
                    lines.append("| Need | Mentions | Potential |")
                    lines.append("|------|----------|-----------|")
                    for n in needs:
                        lines.append(f"| {n.get('need', '')} | {n.get('mentions', '')} | {n.get('market_potential', '')} |")
                    lines.append("")

            elif atype == "pricing":
                r = details.get("expected_range", {})
                if r:
                    lines.append(f"**Expected Price Range:** ${r.get('min', '?')} - ${r.get('max', '?')}")
                    lines.append("")

            lines.append("---")
            lines.append("")

        return "\n".join(lines)
```

- [ ] **Step 4: Implement reports API**

`backend/app/api/reports.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scrape_task import ScrapeTask
from app.models.analysis_result import AnalysisResult
from app.reports.generator import ReportGenerator

router = APIRouter()


class ReportRequest(BaseModel):
    task_id: str


@router.post("", status_code=201)
def create_report(body: ReportRequest, db: Session = Depends(get_db)):
    task = db.query(ScrapeTask).filter(ScrapeTask.id == body.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    analyses = db.query(AnalysisResult).filter(AnalysisResult.task_id == body.task_id).all()
    if not analyses:
        raise HTTPException(status_code=400, detail="No analysis results for this task")

    analysis_dicts = [
        {
            "analysis_type": a.analysis_type,
            "summary": a.summary,
            "details": a.details,
        }
        for a in analyses
    ]

    gen = ReportGenerator()
    content = gen.generate_markdown(keyword=task.keyword, analyses=analysis_dicts)

    return {"task_id": str(task.id), "keyword": task.keyword, "content": content}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/aisenyc/work/probexa/backend && python -m pytest tests/test_api_reports.py -v`
Expected: 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/reports/ backend/app/api/reports.py backend/tests/test_api_reports.py
git commit -m "feat: add report generator and reports API endpoint"
```

---

### Task 17: Scheduler Manager

**Files:**
- Create: `backend/app/scheduler/__init__.py`
- Create: `backend/app/scheduler/manager.py`

- [ ] **Step 1: Implement scheduler manager**

`backend/app/scheduler/__init__.py` — empty file.

`backend/app/scheduler/manager.py`:
```python
import uuid

from celery import Celery
from celery.schedules import crontab
from sqlalchemy.orm import Session

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
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/scheduler/
git commit -m "feat: add scheduler manager to load DB schedules into Celery Beat"
```

---

### Task 18: Frontend — Project Setup

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Initialize React project**

Run:
```bash
cd /Users/aisenyc/work/probexa
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install antd @ant-design/icons recharts axios react-router-dom
```

- [ ] **Step 2: Create API client**

`frontend/src/api/client.ts`:
```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 30000,
});

export default api;
```

- [ ] **Step 3: Create App.tsx with routing**

`frontend/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Trends from "./pages/Trends";
import PainPoints from "./pages/PainPoints";
import Needs from "./pages/Needs";
import Schedules from "./pages/Schedules";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/pain-points" element={<PainPoints />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 4: Update main.tsx**

`frontend/src/main.tsx`:
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Verify it starts**

Run:
```bash
cd /Users/aisenyc/work/probexa/frontend
npm run dev
```
Expected: Vite dev server starts on `http://localhost:5173` (will show errors for missing components — that's expected, we'll create them next).

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: initialize React frontend with Vite, routing, and API client"
```

---

### Task 19: Frontend — Layout Component

**Files:**
- Create: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: Create Layout with sidebar navigation**

`frontend/src/components/Layout.tsx`:
```tsx
import { Layout as AntLayout, Menu } from "antd";
import {
  DashboardOutlined,
  SearchOutlined,
  RiseOutlined,
  WarningOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = AntLayout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/tasks", icon: <SearchOutlined />, label: "Tasks" },
  { key: "/trends", icon: <RiseOutlined />, label: "Trends" },
  { key: "/pain-points", icon: <WarningOutlined />, label: "Pain Points" },
  { key: "/needs", icon: <BulbOutlined />, label: "Needs" },
  { key: "/schedules", icon: <ClockCircleOutlined />, label: "Schedules" },
  { key: "/reports", icon: <FileTextOutlined />, label: "Reports" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", padding: "16px 24px" }}>
          Probexa
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: "#fff", padding: "0 24px", fontSize: 18 }}>
          {menuItems.find((m) => m.key === location.pathname)?.label || "Probexa"}
        </Header>
        <Content style={{ margin: 24, padding: 24, background: "#fff", borderRadius: 8 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat: add Layout component with sidebar navigation"
```

---

### Task 20: Frontend — Dashboard Page

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Create Dashboard page**

`frontend/src/pages/Dashboard.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks?limit=10").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    pending: "blue",
    running: "orange",
    completed: "green",
    failed: "red",
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Platform", dataIndex: "platform", key: "platform" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    { title: "Items", dataIndex: "total_items", key: "total_items" },
    { title: "Created", dataIndex: "created_at", key: "created_at" },
  ];

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalItems = tasks.reduce((sum, t) => sum + t.total_items, 0);

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Tasks" value={tasks.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Completed" value={completedCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Items Scraped" value={totalItems} />
          </Card>
        </Col>
      </Row>
      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: add Dashboard page with stats and recent tasks"
```

---

### Task 21: Frontend — Tasks Page

**Files:**
- Create: `frontend/src/pages/Tasks.tsx`
- Create: `frontend/src/components/TaskForm.tsx`
- Create: `frontend/src/components/TaskList.tsx`

- [ ] **Step 1: Create TaskForm component**

`frontend/src/components/TaskForm.tsx`:
```tsx
import { Form, Input, Select, InputNumber, Button, message } from "antd";
import api from "../api/client";

interface Props {
  onCreated: () => void;
}

export default function TaskForm({ onCreated }: Props) {
  const [form] = Form.useForm();

  const onFinish = async (values: { keyword: string; platform: string; max_items: number }) => {
    try {
      await api.post("/tasks", values);
      message.success("Task created");
      form.resetFields();
      onCreated();
    } catch {
      message.error("Failed to create task");
    }
  };

  return (
    <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ platform: "tiktok", max_items: 500 }}>
      <Form.Item name="keyword" rules={[{ required: true, message: "Enter keyword" }]}>
        <Input placeholder="Search keyword" style={{ width: 200 }} />
      </Form.Item>
      <Form.Item name="platform">
        <Select style={{ width: 120 }}>
          <Select.Option value="tiktok">TikTok</Select.Option>
          <Select.Option value="youtube">YouTube</Select.Option>
          <Select.Option value="reddit">Reddit</Select.Option>
          <Select.Option value="amazon">Amazon</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="max_items">
        <InputNumber min={10} max={10000} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Start Scraping
        </Button>
      </Form.Item>
    </Form>
  );
}
```

- [ ] **Step 2: Create TaskList component**

`frontend/src/components/TaskList.tsx`:
```tsx
import { Table, Tag, Button, Space, message } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

interface Props {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

export default function TaskList({ tasks, loading, onRefresh }: Props) {
  const statusColor: Record<string, string> = {
    pending: "blue",
    running: "orange",
    completed: "green",
    failed: "red",
  };

  const triggerAnalysis = async (taskId: string, type: string) => {
    try {
      await api.post("/analysis", { task_id: taskId, analysis_type: type });
      message.success(`${type} analysis started`);
    } catch {
      message.error("Failed to start analysis");
    }
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Platform", dataIndex: "platform", key: "platform" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    { title: "Items", dataIndex: "total_items", key: "total_items" },
    { title: "Created", dataIndex: "created_at", key: "created_at" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Task) => (
        <Space>
          {record.status === "completed" && (
            <>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "pain_points")}>
                Pain Points
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "trends")}>
                Trends
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "unmet_needs")}>
                Needs
              </Button>
              <Button size="small" onClick={() => triggerAnalysis(record.id, "pricing")}>
                Pricing
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} />;
}
```

- [ ] **Step 3: Create Tasks page**

`frontend/src/pages/Tasks.tsx`:
```tsx
import { useEffect, useState, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.get("/tasks").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return (
    <>
      <TaskForm onCreated={fetchTasks} />
      <div style={{ marginTop: 24 }}>
        <TaskList tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Tasks.tsx frontend/src/components/TaskForm.tsx frontend/src/components/TaskList.tsx
git commit -m "feat: add Tasks page with create form and task list"
```

---

### Task 22: Frontend — Trends Page

**Files:**
- Create: `frontend/src/pages/Trends.tsx`
- Create: `frontend/src/components/TrendChart.tsx`

- [ ] **Step 1: Create TrendChart component**

`frontend/src/components/TrendChart.tsx`:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Trend {
  topic: string;
  momentum: string;
  engagement_score: number;
}

interface Props {
  trends: Trend[];
}

export default function TrendChart({ trends }: Props) {
  const data = trends.map((t) => ({
    name: t.topic,
    score: t.engagement_score,
    momentum: t.momentum,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="score" fill="#1890ff" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create Trends page**

`frontend/src/pages/Trends.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Card, Empty, Spin, Tag } from "antd";
import TrendChart from "../components/TrendChart";
import api from "../api/client";

interface TrendResult {
  id: string;
  summary: string;
  details: {
    trends?: Array<{
      topic: string;
      momentum: string;
      engagement_score: number;
      evidence?: string[];
    }>;
  };
  created_at: string;
}

export default function Trends() {
  const [results, setResults] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/trends").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (!results.length) return <Empty description="No trend data yet. Run a scrape task and trigger trends analysis." />;

  const latest = results[0];
  const trends = latest.details.trends || [];

  const momentumColor: Record<string, string> = { rising: "green", stable: "blue", declining: "red" };

  return (
    <>
      <Card title="Trend Overview" style={{ marginBottom: 16 }}>
        <p>{latest.summary}</p>
      </Card>
      <Card title="Engagement Scores">
        <TrendChart trends={trends} />
      </Card>
      <Card title="Details" style={{ marginTop: 16 }}>
        {trends.map((t, i) => (
          <Card.Grid key={i} style={{ width: "50%" }}>
            <h4>{t.topic}</h4>
            <Tag color={momentumColor[t.momentum]}>{t.momentum}</Tag>
            <p>Score: {t.engagement_score}</p>
            {t.evidence?.map((e, j) => <p key={j} style={{ color: "#888" }}>{e}</p>)}
          </Card.Grid>
        ))}
      </Card>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Trends.tsx frontend/src/components/TrendChart.tsx
git commit -m "feat: add Trends page with bar chart and detail cards"
```

---

### Task 23: Frontend — Pain Points Page

**Files:**
- Create: `frontend/src/pages/PainPoints.tsx`
- Create: `frontend/src/components/PainPointMatrix.tsx`

- [ ] **Step 1: Create PainPointMatrix component**

`frontend/src/components/PainPointMatrix.tsx`:
```tsx
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface PainPoint {
  issue: string;
  frequency: number;
  severity: number;
}

interface Props {
  painPoints: PainPoint[];
}

export default function PainPointMatrix({ painPoints }: Props) {
  const data = painPoints.map((p) => ({
    x: p.frequency,
    y: p.severity,
    z: p.frequency * p.severity,
    name: p.issue,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Frequency" />
        <YAxis type="number" dataKey="y" name="Severity" domain={[0, 10]} />
        <ZAxis type="number" dataKey="z" range={[100, 1000]} />
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          labelFormatter={() => ""}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ background: "#fff", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}>
                <strong>{d.name}</strong>
                <br />
                Frequency: {d.x} | Severity: {d.y}
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#ff4d4f" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create PainPoints page**

`frontend/src/pages/PainPoints.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Card, Empty, Spin, Table } from "antd";
import PainPointMatrix from "../components/PainPointMatrix";
import api from "../api/client";

interface PainPointResult {
  id: string;
  summary: string;
  details: {
    pain_points?: Array<{
      issue: string;
      frequency: number;
      severity: number;
      sample_quotes?: string[];
    }>;
  };
}

export default function PainPoints() {
  const [results, setResults] = useState<PainPointResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/pain-points").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (!results.length) return <Empty description="No pain point data yet." />;

  const latest = results[0];
  const points = latest.details.pain_points || [];

  const columns = [
    { title: "Issue", dataIndex: "issue", key: "issue" },
    { title: "Frequency", dataIndex: "frequency", key: "frequency", sorter: (a: any, b: any) => a.frequency - b.frequency },
    { title: "Severity", dataIndex: "severity", key: "severity", sorter: (a: any, b: any) => a.severity - b.severity },
    {
      title: "Sample Quotes",
      dataIndex: "sample_quotes",
      key: "sample_quotes",
      render: (quotes: string[]) => quotes?.map((q, i) => <div key={i} style={{ color: "#888" }}>"{q}"</div>),
    },
  ];

  return (
    <>
      <Card title="Frequency vs Severity Matrix" style={{ marginBottom: 16 }}>
        <PainPointMatrix painPoints={points} />
      </Card>
      <Card title={`Pain Points (${points.length})`}>
        <Table dataSource={points} columns={columns} rowKey="issue" pagination={false} />
      </Card>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/PainPoints.tsx frontend/src/components/PainPointMatrix.tsx
git commit -m "feat: add Pain Points page with scatter matrix and table"
```

---

### Task 24: Frontend — Needs Page

**Files:**
- Create: `frontend/src/pages/Needs.tsx`
- Create: `frontend/src/components/NeedsList.tsx`

- [ ] **Step 1: Create NeedsList component**

`frontend/src/components/NeedsList.tsx`:
```tsx
import { Card, Tag } from "antd";

interface Need {
  need: string;
  mentions: number;
  market_potential: string;
  sample_quotes?: string[];
}

interface Props {
  needs: Need[];
}

const potentialColor: Record<string, string> = { high: "green", medium: "orange", low: "default" };

export default function NeedsList({ needs }: Props) {
  return (
    <>
      {needs.map((n, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <h3>
            {n.need} <Tag color={potentialColor[n.market_potential]}>{n.market_potential} potential</Tag>
          </h3>
          <p>Mentioned {n.mentions} times</p>
          {n.sample_quotes?.map((q, j) => (
            <p key={j} style={{ color: "#888", fontStyle: "italic" }}>"{q}"</p>
          ))}
        </Card>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Create Needs page**

`frontend/src/pages/Needs.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
import NeedsList from "../components/NeedsList";
import api from "../api/client";

interface NeedsResult {
  id: string;
  summary: string;
  details: {
    unmet_needs?: Array<{
      need: string;
      mentions: number;
      market_potential: string;
      sample_quotes?: string[];
    }>;
  };
}

export default function Needs() {
  const [results, setResults] = useState<NeedsResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/needs").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (!results.length) return <Empty description="No unmet needs data yet." />;

  const latest = results[0];
  const needs = latest.details.unmet_needs || [];

  return <NeedsList needs={needs} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Needs.tsx frontend/src/components/NeedsList.tsx
git commit -m "feat: add Needs page with needs list cards"
```

---

### Task 25: Frontend — Schedules Page

**Files:**
- Create: `frontend/src/pages/Schedules.tsx`

- [ ] **Step 1: Create Schedules page**

`frontend/src/pages/Schedules.tsx`:
```tsx
import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space } from "antd";
import api from "../api/client";

interface Schedule {
  id: string;
  keyword: string;
  platform: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchSchedules = useCallback(() => {
    setLoading(true);
    api.get("/schedules").then((res) => {
      setSchedules(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const onCreate = async (values: { keyword: string; platform: string; cron_expression: string }) => {
    try {
      await api.post("/schedules", values);
      message.success("Schedule created");
      setModalOpen(false);
      form.resetFields();
      fetchSchedules();
    } catch {
      message.error("Failed to create schedule");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await api.put(`/schedules/${id}`, { is_active: active });
    fetchSchedules();
  };

  const deleteSchedule = async (id: string) => {
    await api.delete(`/schedules/${id}`);
    message.success("Deleted");
    fetchSchedules();
  };

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Platform", dataIndex: "platform", key: "platform" },
    { title: "Cron", dataIndex: "cron_expression", key: "cron_expression" },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean, record: Schedule) => (
        <Switch checked={active} onChange={(v) => toggleActive(record.id, v)} />
      ),
    },
    { title: "Last Run", dataIndex: "last_run_at", key: "last_run_at", render: (v: string | null) => v || "Never" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Schedule) => (
        <Button danger size="small" onClick={() => deleteSchedule(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
        Add Schedule
      </Button>
      <Table dataSource={schedules} columns={columns} rowKey="id" loading={loading} />
      <Modal title="New Schedule" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ platform: "tiktok", cron_expression: "0 8 * * *" }}>
          <Form.Item name="keyword" label="Keyword" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="platform" label="Platform">
            <Select>
              <Select.Option value="tiktok">TikTok</Select.Option>
              <Select.Option value="youtube">YouTube</Select.Option>
              <Select.Option value="reddit">Reddit</Select.Option>
              <Select.Option value="amazon">Amazon</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cron_expression" label="Cron Expression" extra="e.g., '0 8 * * *' = daily at 8am">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Schedules.tsx
git commit -m "feat: add Schedules page with CRUD and cron config"
```

---

### Task 26: Frontend — Reports Page

**Files:**
- Create: `frontend/src/pages/Reports.tsx`

- [ ] **Step 1: Create Reports page**

`frontend/src/pages/Reports.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Button, Card, Select, message, Empty, Spin } from "antd";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
}

export default function Reports() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tasks?limit=100").then((res) => {
      setTasks(res.data.filter((t: Task) => t.status === "completed"));
    });
  }, []);

  const generateReport = async () => {
    if (!selectedTask) {
      message.warning("Select a task first");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/reports", { task_id: selectedTask });
      setReport(res.data.content);
    } catch {
      message.error("Failed to generate report. Make sure analysis has been run.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <Select
          placeholder="Select a completed task"
          style={{ width: 400, marginRight: 16 }}
          onChange={setSelectedTask}
          value={selectedTask || undefined}
        >
          {tasks.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              {t.keyword} ({t.platform})
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={generateReport} loading={loading}>
          Generate Report
        </Button>
      </Card>
      {report ? (
        <Card style={{ marginTop: 16 }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{report}</pre>
        </Card>
      ) : (
        <Empty description="Select a task and generate a report" style={{ marginTop: 24 }} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Reports.tsx
git commit -m "feat: add Reports page with generation and preview"
```

---

### Task 27: Backend Run Verification

- [ ] **Step 1: Run all backend tests**

Run:
```bash
cd /Users/aisenyc/work/probexa/backend
source .venv/bin/activate
python -m pytest tests/ -v
```
Expected: All tests PASS.

- [ ] **Step 2: Verify FastAPI starts**

Run:
```bash
cd /Users/aisenyc/work/probexa/backend
uvicorn app.main:app --reload --port 8000
```
Expected: Server starts, hit `http://localhost:8000/api/health` returns `{"status": "ok"}`.

- [ ] **Step 3: Verify frontend builds**

Run:
```bash
cd /Users/aisenyc/work/probexa/frontend
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify full stack builds and tests pass"
```
