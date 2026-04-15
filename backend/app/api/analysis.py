import uuid as _uuid

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
    analysis_type: str
    model: str = "gpt-4o-mini"


@router.post("", status_code=202)
def trigger_analysis(body: AnalysisRequest, db: Session = Depends(get_db)):
    task = db.query(ScrapeTask).filter(ScrapeTask.id == _uuid.UUID(body.task_id)).first()
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
    result = db.query(AnalysisResult).filter(AnalysisResult.id == _uuid.UUID(analysis_id)).first()
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
