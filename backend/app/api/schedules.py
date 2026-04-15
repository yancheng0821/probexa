import uuid
from uuid import UUID as _UUID

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
    job = db.query(ScheduledJob).filter(ScheduledJob.id == _UUID(schedule_id)).first()
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
    job = db.query(ScheduledJob).filter(ScheduledJob.id == _UUID(schedule_id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(job)
    db.commit()
