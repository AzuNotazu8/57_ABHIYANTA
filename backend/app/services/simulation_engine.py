from app.models.climate import ClimateData
from app.models.simulation import SimulationResult


PREY_STRESS_THRESHOLD = 0.5
BASE_TIGER_MIGRATION = 10.0
HUMAN_DENSITY_FACTOR = 0.65


def clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


def normalize(value: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.0
    return (value - min_val) / (max_val - min_val)


def compute_flood_risk(temp: float, rainfall: float, glacier: float) -> float:
    t_norm = normalize(temp, 20.0, 40.0)
    r_norm = normalize(rainfall, 1000.0, 4000.0)
    g_norm = normalize(glacier, 0.0, 10.0)
    raw = (t_norm * 0.4) + (r_norm * 0.4) + (g_norm * 0.2)
    return clamp(raw * 100)


def compute_glacier_amplification(glacier: float) -> float:
    return clamp(normalize(glacier, 0.0, 10.0) * 100)


def compute_prey_stress(vegetation: float, flood_risk: float, salinity: float) -> float:
    flood_norm = flood_risk / 100.0
    raw = ((1 - vegetation) * 0.4) + (flood_norm * 0.4) + (salinity * 0.2)
    return clamp(raw * 100)


def compute_prey_migration(prey_stress: float) -> float:
    stress_norm = prey_stress / 100.0
    if stress_norm <= PREY_STRESS_THRESHOLD:
        return 0.0
    scaled = (stress_norm - PREY_STRESS_THRESHOLD) / (1 - PREY_STRESS_THRESHOLD)
    return clamp(scaled * 100)


def compute_tiger_migration(prey_migration: float) -> float:
    raw = BASE_TIGER_MIGRATION + (prey_migration * 0.6)
    return clamp(raw)


def compute_zoonotic_risk(human_density: float, wildlife_displacement: float, flood_risk: float) -> float:
    flood_norm = flood_risk / 100.0
    raw = (human_density * 0.4) + (wildlife_displacement * 0.4) + (flood_norm * 0.2)
    return clamp(raw * 100)


def run_simulation_for_record(climate: ClimateData, scenario: str = "baseline", is_projection: bool = False) -> SimulationResult:
    glacier = climate.glacier_contribution_cm or 0.0
    vegetation = climate.vegetation_proxy or 0.5
    salinity = climate.salinity_proxy or 0.3

    flood_risk = compute_flood_risk(climate.temperature_celsius, climate.rainfall_mm, glacier)
    glacier_amp = compute_glacier_amplification(glacier)
    prey_stress = compute_prey_stress(vegetation, flood_risk, salinity)
    prey_migration = compute_prey_migration(prey_stress)
    tiger_migration = compute_tiger_migration(prey_migration)

    wildlife_displacement = prey_migration / 100.0
    zoonotic_risk = compute_zoonotic_risk(HUMAN_DENSITY_FACTOR, wildlife_displacement, flood_risk)

    return SimulationResult(
        year=climate.year,
        flood_risk=round(flood_risk, 2),
        glacier_amplification=round(glacier_amp, 2),
        prey_stress_index=round(prey_stress, 2),
        prey_migration_probability=round(prey_migration, 2),
        tiger_migration_probability=round(tiger_migration, 2),
        zoonotic_risk_index=round(zoonotic_risk, 2),
        human_density_factor=round(HUMAN_DENSITY_FACTOR, 2),
        wildlife_displacement_score=round(wildlife_displacement, 2),
        is_projection=is_projection,
        scenario=scenario,
    )
