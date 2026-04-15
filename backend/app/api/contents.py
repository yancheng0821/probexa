import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import Content

router = APIRouter()


@router.get("")
def list_contents(
    platform: str | None = None,
    task_id: str | None = None,
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
    content = db.query(Content).filter(Content.id == _uuid.UUID(content_id)).first()
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
