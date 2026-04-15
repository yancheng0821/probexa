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

        merged_details = all_results[0] if len(all_results) == 1 else {"chunks": all_results}

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
