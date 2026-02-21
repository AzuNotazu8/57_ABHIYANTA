from pydantic import BaseModel
from typing import List, Optional


class PerYearValidation(BaseModel):
    year: int
    predicted_flood_risk: float
    observed_flood_risk: float
    flood_abs_error: float
    predicted_zoonotic_risk: float
    observed_zoonotic_risk: float
    zoonotic_abs_error: float


class ValidationSummary(BaseModel):
    flood_risk_mae: float
    flood_risk_mean_error_pct: float
    zoonotic_risk_mae: float
    zoonotic_risk_mean_error_pct: float
    validation_note: str


class ValidationResponse(BaseModel):
    summary: ValidationSummary
    per_year: List[PerYearValidation]
