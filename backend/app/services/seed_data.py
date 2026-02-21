from sqlalchemy.orm import Session
from app.models.climate import ClimateData

SYNTHETIC_CLIMATE_DATA = [
    {"year": 2014, "temperature_celsius": 27.2, "rainfall_mm": 1820, "glacier_contribution_cm": 2.1, "sea_level_rise_mm": 3.2, "salinity_proxy": 0.32, "vegetation_proxy": 0.68},
    {"year": 2015, "temperature_celsius": 27.8, "rainfall_mm": 1650, "glacier_contribution_cm": 2.4, "sea_level_rise_mm": 3.4, "salinity_proxy": 0.35, "vegetation_proxy": 0.65},
    {"year": 2016, "temperature_celsius": 28.4, "rainfall_mm": 2100, "glacier_contribution_cm": 2.8, "sea_level_rise_mm": 3.7, "salinity_proxy": 0.38, "vegetation_proxy": 0.62},
    {"year": 2017, "temperature_celsius": 28.1, "rainfall_mm": 1980, "glacier_contribution_cm": 3.0, "sea_level_rise_mm": 3.9, "salinity_proxy": 0.36, "vegetation_proxy": 0.63},
    {"year": 2018, "temperature_celsius": 28.9, "rainfall_mm": 2250, "glacier_contribution_cm": 3.3, "sea_level_rise_mm": 4.1, "salinity_proxy": 0.40, "vegetation_proxy": 0.60},
    {"year": 2019, "temperature_celsius": 29.3, "rainfall_mm": 2400, "glacier_contribution_cm": 3.6, "sea_level_rise_mm": 4.4, "salinity_proxy": 0.42, "vegetation_proxy": 0.57},
    {"year": 2020, "temperature_celsius": 29.7, "rainfall_mm": 2600, "glacier_contribution_cm": 4.0, "sea_level_rise_mm": 4.8, "salinity_proxy": 0.45, "vegetation_proxy": 0.55},
    {"year": 2021, "temperature_celsius": 30.1, "rainfall_mm": 2750, "glacier_contribution_cm": 4.3, "sea_level_rise_mm": 5.1, "salinity_proxy": 0.47, "vegetation_proxy": 0.52},
    {"year": 2022, "temperature_celsius": 30.5, "rainfall_mm": 2900, "glacier_contribution_cm": 4.7, "sea_level_rise_mm": 5.5, "salinity_proxy": 0.49, "vegetation_proxy": 0.50},
    {"year": 2023, "temperature_celsius": 30.9, "rainfall_mm": 3050, "glacier_contribution_cm": 5.1, "sea_level_rise_mm": 5.9, "salinity_proxy": 0.51, "vegetation_proxy": 0.48},
]


def seed_climate_data(db: Session):
    existing = db.query(ClimateData).count()
    if existing > 0:
        return

    for row in SYNTHETIC_CLIMATE_DATA:
        record = ClimateData(
            **row,
            is_synthetic=True,
            data_source="AETHERA synthetic baseline (NASA/FAO-aligned)"
        )
        db.add(record)
    db.commit()
