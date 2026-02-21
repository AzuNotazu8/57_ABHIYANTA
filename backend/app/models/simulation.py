from sqlalchemy import Column, Integer, Float, Boolean, String
from app.db.base import Base


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    flood_risk = Column(Float, nullable=False)
    glacier_amplification = Column(Float, nullable=False)
    prey_stress_index = Column(Float, nullable=False)
    prey_migration_probability = Column(Float, nullable=False)
    tiger_migration_probability = Column(Float, nullable=False)
    zoonotic_risk_index = Column(Float, nullable=False)
    human_density_factor = Column(Float, nullable=True)
    wildlife_displacement_score = Column(Float, nullable=True)
    is_projection = Column(Boolean, default=False)
    scenario = Column(String, default="baseline")
