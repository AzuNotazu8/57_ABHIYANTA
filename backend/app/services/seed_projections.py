from sqlalchemy.orm import Session
from app.models.climate import ClimateData

PROJECTION_CLIMATE_DATA = [
    {"year": 2024, "temperature_celsius": 31.3, "rainfall_mm": 3180, "glacier_contribution_cm": 5.5, "sea_level_rise_mm": 6.3, "salinity_proxy": 0.53, "vegetation_proxy": 0.46},
    {"year": 2025, "temperature_celsius": 31.7, "rainfall_mm": 3290, "glacier_contribution_cm": 5.9, "sea_level_rise_mm": 6.7, "salinity_proxy": 0.55, "vegetation_proxy": 0.44},
    {"year": 2026, "temperature_celsius": 32.1, "rainfall_mm": 3380, "glacier_contribution_cm": 6.3, "sea_level_rise_mm": 7.1, "salinity_proxy": 0.57, "vegetation_proxy": 0.42},
    {"year": 2027, "temperature_celsius": 32.5, "rainfall_mm": 3460, "glacier_contribution_cm": 6.7, "sea_level_rise_mm": 7.6, "salinity_proxy": 0.59, "vegetation_proxy": 0.40},
    {"year": 2028, "temperature_celsius": 32.9, "rainfall_mm": 3530, "glacier_contribution_cm": 7.1, "sea_level_rise_mm": 8.0, "salinity_proxy": 0.61, "vegetation_proxy": 0.38},
    {"year": 2029, "temperature_celsius": 33.3, "rainfall_mm": 3600, "glacier_contribution_cm": 7.5, "sea_level_rise_mm": 8.5, "salinity_proxy": 0.63, "vegetation_proxy": 0.36},
    {"year": 2030, "temperature_celsius": 33.7, "rainfall_mm": 3660, "glacier_contribution_cm": 7.9, "sea_level_rise_mm": 9.0, "salinity_proxy": 0.65, "vegetation_proxy": 0.34},
    {"year": 2031, "temperature_celsius": 34.1, "rainfall_mm": 3720, "glacier_contribution_cm": 8.3, "sea_level_rise_mm": 9.5, "salinity_proxy": 0.67, "vegetation_proxy": 0.32},
    {"year": 2032, "temperature_celsius": 34.5, "rainfall_mm": 3780, "glacier_contribution_cm": 8.7, "sea_level_rise_mm": 10.0, "salinity_proxy": 0.69, "vegetation_proxy": 0.30},
    {"year": 2033, "temperature_celsius": 34.9, "rainfall_mm": 3840, "glacier_contribution_cm": 9.1, "sea_level_rise_mm": 10.6, "salinity_proxy": 0.71, "vegetation_proxy": 0.28},
]


def seed_projection_data(db: Session):
    existing = db.query(ClimateData).filter(ClimateData.year >= 2024).count()
    if existing > 0:
        return

    for row in PROJECTION_CLIMATE_DATA:
        record = ClimateData(
            **row,
            is_synthetic=True,
            data_source="AETHERA projection synthetic (trend-extrapolated)"
        )
        db.add(record)
    db.commit()
