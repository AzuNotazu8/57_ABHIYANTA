from sqlalchemy import Column, Integer, Float, String, Boolean
from app.db.base import Base


class ClimateData(Base):
    __tablename__ = "climate_data"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    temperature_celsius = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    glacier_contribution_cm = Column(Float, nullable=True)
    sea_level_rise_mm = Column(Float, nullable=True)
    salinity_proxy = Column(Float, nullable=True)
    vegetation_proxy = Column(Float, nullable=True)
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String, nullable=True)
