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
    task = db.query(ScrapeTask).filter(ScrapeTask.id == uuid.UUID(task_id)).first()
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
    task = db.query(ScrapeTask).filter(ScrapeTask.id == uuid.UUID(task_id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
