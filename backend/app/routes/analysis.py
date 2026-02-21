from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.simulation import SimulationResult
from app.schemas.simulation import SimulationResultOut
from app.services.projection_engine import run_projection
from app.services.validation_engine import run_validation

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/project", response_model=List[SimulationResultOut])
def project_future(scenario: str = "baseline", db: Session = Depends(get_db)):
    return run_projection(db, scenario=scenario)


@router.get("/project/results", response_model=List[SimulationResultOut])
def get_projections(db: Session = Depends(get_db)):
    return (
        db.query(SimulationResult)
        .filter(SimulationResult.is_projection == True)
        .order_by(SimulationResult.year)
        .all()
    )


@router.get("/validate")
def validate_historical(db: Session = Depends(get_db)):
    return run_validation(db)


@router.get("/timeline", response_model=List[SimulationResultOut])
def full_timeline(db: Session = Depends(get_db)):
    return (
        db.query(SimulationResult)
        .order_by(SimulationResult.year)
        .all()
    )


@router.post("/run-all")
def run_all(scenario: str = "baseline", db: Session = Depends(get_db)):
    from app.models.climate import ClimateData
    from app.services.simulation_engine import run_simulation_for_record

    historical = (
        db.query(ClimateData)
        .filter(ClimateData.year >= 2014, ClimateData.year <= 2023)
        .order_by(ClimateData.year)
        .all()
    )

    db.query(SimulationResult).filter(
        SimulationResult.year >= 2014,
        SimulationResult.year <= 2023,
        SimulationResult.is_projection == False,
        SimulationResult.scenario == scenario,
    ).delete()
    db.commit()

    for climate in historical:
        result = run_simulation_for_record(climate, scenario=scenario, is_projection=False)
        db.add(result)
    db.commit()

    projections = run_projection(db, scenario=scenario)

    all_results = (
        db.query(SimulationResult)
        .order_by(SimulationResult.year)
        .all()
    )

    validation = run_validation(db)

    return {
        "message": "Full simulation complete",
        "historical_years": 10,
        "projection_years": 10,
        "validation_summary": validation["summary"],
        "total_records": len(all_results),
    }
