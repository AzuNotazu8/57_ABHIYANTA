from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.climate import ClimateData
from app.models.simulation import SimulationResult
from app.schemas.simulation import SimulationResultOut, RunSimulationRequest
from app.services.simulation_engine import run_simulation_for_record

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/run", response_model=List[SimulationResultOut])
def run_simulation(payload: RunSimulationRequest, db: Session = Depends(get_db)):
    climate_records = (
        db.query(ClimateData)
        .filter(ClimateData.year >= payload.year_start, ClimateData.year <= payload.year_end)
        .order_by(ClimateData.year)
        .all()
    )
    if not climate_records:
        raise HTTPException(status_code=404, detail="No climate data found for range")

    db.query(SimulationResult).filter(
        SimulationResult.year >= payload.year_start,
        SimulationResult.year <= payload.year_end,
        SimulationResult.scenario == payload.scenario,
    ).delete()
    db.commit()

    results = []
    for climate in climate_records:
        result = run_simulation_for_record(climate, scenario=payload.scenario, is_projection=False)
        db.add(result)
        results.append(result)

    db.commit()
    for r in results:
        db.refresh(r)
    return results


@router.get("/results", response_model=List[SimulationResultOut])
def get_results(db: Session = Depends(get_db)):
    return db.query(SimulationResult).order_by(SimulationResult.year).all()


@router.get("/results/{year}", response_model=SimulationResultOut)
def get_result_by_year(year: int, db: Session = Depends(get_db)):
    record = db.query(SimulationResult).filter(SimulationResult.year == year).first()
    if not record:
        raise HTTPException(status_code=404, detail="No simulation result for this year")
    return record
