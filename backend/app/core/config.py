from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    gemini_api_key: str | None = None   # ← ADD THIS

    class Config:
        env_file = ".env"


settings = Settings()
