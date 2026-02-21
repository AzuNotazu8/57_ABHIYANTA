from sqlalchemy.orm import Session
from app.models.climate import ClimateData
from app.models.simulation import SimulationResult
from app.services.simulation_engine import run_simulation_for_record


def run_projection(db: Session, scenario: str = "baseline") -> list[SimulationResult]:
    climate_records = (
        db.query(ClimateData)
        .filter(ClimateData.year >= 2024, ClimateData.year <= 2033)
        .order_by(ClimateData.year)
        .all()
    )

    db.query(SimulationResult).filter(
        SimulationResult.year >= 2024,
        SimulationResult.is_projection == True,
        SimulationResult.scenario == scenario,
    ).delete()
    db.commit()

    results = []
    for climate in climate_records:
        result = run_simulation_for_record(climate, scenario=scenario, is_projection=True)
        db.add(result)
        results.append(result)

    db.commit()
    for r in results:
        db.refresh(r)
    return results
