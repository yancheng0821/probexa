import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException
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
    task = db.query(ScrapeTask).filter(ScrapeTask.id == _uuid.UUID(body.task_id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    analyses = db.query(AnalysisResult).filter(AnalysisResult.task_id == _uuid.UUID(body.task_id)).all()
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
