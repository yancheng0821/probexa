from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://probexa:probexa@localhost:5432/probexa"
    redis_url: str = "redis://localhost:6379/0"
    openai_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
