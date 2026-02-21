from pydantic import BaseModel
from typing import Optional


class SimulationResultOut(BaseModel):
    id: int
    year: int
    flood_risk: float
    glacier_amplification: float
    prey_stress_index: float
    prey_migration_probability: float
    tiger_migration_probability: float
    zoonotic_risk_index: float
    human_density_factor: Optional[float]
    wildlife_displacement_score: Optional[float]
    is_projection: bool
    scenario: str

    class Config:
        from_attributes = True


class RunSimulationRequest(BaseModel):
    year_start: int = 2014
    year_end: int = 2023
    scenario: str = "baseline"
