from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis_result import AnalysisResult

router = APIRouter()


def _format_result(r):
    return {
        "id": str(r.id),
        "task_id": str(r.task_id),
        "summary": r.summary,
        "details": r.details,
        "created_at": str(r.created_at),
    }


@router.get("/trends")
def get_trends(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    results = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.analysis_type == "trends")
        .order_by(AnalysisResult.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return [_format_result(r) for r in results]


@router.get("/pain-points")
def get_pain_points(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    results = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.analysis_type == "pain_points")
        .order_by(AnalysisResult.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return [_format_result(r) for r in results]


@router.get("/needs")
def get_needs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    results = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.analysis_type == "unmet_needs")
        .order_by(AnalysisResult.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return [_format_result(r) for r in results]
