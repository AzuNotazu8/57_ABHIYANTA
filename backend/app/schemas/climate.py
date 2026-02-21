from pydantic import BaseModel, Field
from typing import Optional


class ClimateDataCreate(BaseModel):
    year: int
    temperature_celsius: float = Field(..., ge=-10, le=60)
    rainfall_mm: float = Field(..., ge=0, le=5000)
    glacier_contribution_cm: Optional[float] = None
    sea_level_rise_mm: Optional[float] = None
    salinity_proxy: Optional[float] = Field(None, ge=0, le=1)
    vegetation_proxy: Optional[float] = Field(None, ge=0, le=1)
    is_synthetic: bool = False
    data_source: Optional[str] = None


class ClimateDataOut(ClimateDataCreate):
    id: int

    class Config:
        from_attributes = True
