from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.middleware import limiter
from app.db.database import SessionLocal
from app.routes import climate, simulation, analysis, report
from app.services.seed_data import seed_climate_data
from app.services.seed_projections import seed_projection_data

app = FastAPI(title="AETHERA", version="2.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(climate.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(report.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_climate_data(db)
        seed_projection_data(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "AETHERA backend running", "phase": 2}
