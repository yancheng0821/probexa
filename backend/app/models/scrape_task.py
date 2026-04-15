import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ScrapeTask(Base):
    __tablename__ = "scrape_tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    keyword: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    total_items: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
