from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import tasks, contents, analysis, insights, schedules, reports

app = FastAPI(title="Probexa", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
