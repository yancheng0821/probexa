from app.tasks.celery_app import celery_app


def test_celery_app_configured():
    assert celery_app.main == "probexa"
    assert "redis" in celery_app.conf.broker_url
