from sqlalchemy.orm import Session
from app.models.simulation import SimulationResult


OBSERVED_FLOOD_EVENTS = {
    2014: 28.0,
    2015: 31.0,
    2016: 45.0,
    2017: 42.0,
    2018: 55.0,
    2019: 60.0,
    2020: 68.0,
    2021: 72.0,
    2022: 78.0,
    2023: 82.0,
}

OBSERVED_ZOONOTIC_EVENTS = {
    2014: 22.0,
    2015: 25.0,
    2016: 33.0,
    2017: 31.0,
    2018: 40.0,
    2019: 44.0,
    2020: 51.0,
    2021: 55.0,
    2022: 60.0,
    2023: 65.0,
}


def compute_mae(predicted: list[float], observed: list[float]) -> float:
    if not predicted or len(predicted) != len(observed):
        return -1.0
    total = sum(abs(p - o) for p, o in zip(predicted, observed))
    return round(total / len(predicted), 2)


def compute_error_pct(predicted: list[float], observed: list[float]) -> float:
    if not predicted or len(predicted) != len(observed):
        return -1.0
    pct_errors = []
    for p, o in zip(predicted, observed):
        if o != 0:
            pct_errors.append(abs(p - o) / o * 100)
    if not pct_errors:
        return 0.0
    return round(sum(pct_errors) / len(pct_errors), 2)


def run_validation(db: Session) -> dict:
    results = (
        db.query(SimulationResult)
        .filter(SimulationResult.year >= 2014, SimulationResult.year <= 2023, SimulationResult.is_projection == False)
        .order_by(SimulationResult.year)
        .all()
    )

    if not results:
        return {"error": "No historical simulation results found. Run /api/simulation/run first."}

    years = [r.year for r in results]

    predicted_flood = [r.flood_risk for r in results]
    observed_flood = [OBSERVED_FLOOD_EVENTS.get(y, 0.0) for y in years]

    predicted_zoonotic = [r.zoonotic_risk_index for r in results]
    observed_zoonotic = [OBSERVED_ZOONOTIC_EVENTS.get(y, 0.0) for y in years]

    flood_mae = compute_mae(predicted_flood, observed_flood)
    flood_err_pct = compute_error_pct(predicted_flood, observed_flood)

    zoonotic_mae = compute_mae(predicted_zoonotic, observed_zoonotic)
    zoonotic_err_pct = compute_error_pct(predicted_zoonotic, observed_zoonotic)

    per_year = []
    for i, r in enumerate(results):
        per_year.append({
            "year": r.year,
            "predicted_flood_risk": r.flood_risk,
            "observed_flood_risk": observed_flood[i],
            "flood_abs_error": round(abs(r.flood_risk - observed_flood[i]), 2),
            "predicted_zoonotic_risk": r.zoonotic_risk_index,
            "observed_zoonotic_risk": observed_zoonotic[i],
            "zoonotic_abs_error": round(abs(r.zoonotic_risk_index - observed_zoonotic[i]), 2),
        })

    return {
        "summary": {
            "flood_risk_mae": flood_mae,
            "flood_risk_mean_error_pct": flood_err_pct,
            "zoonotic_risk_mae": zoonotic_mae,
            "zoonotic_risk_mean_error_pct": zoonotic_err_pct,
            "validation_note": "Observed values are synthetic reference benchmarks aligned to Sundarbans historical event frequency.",
        },
        "per_year": per_year,
    }
