from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import google.generativeai as genai
import os

from app.db.database import get_db
from app.models.simulation import SimulationResult
from app.core.config import settings

router = APIRouter(prefix="/report", tags=["report"])


class ReportRequest(BaseModel):
    scenario: str = "baseline"


def build_prompt(historical, projections):
    def fmt(r):
        return (
            f"  Year {r.year}: FloodRisk={r.flood_risk:.1f}, "
            f"GlacierAmp={r.glacier_amplification:.1f}, "
            f"PreyMigration={r.prey_migration_probability:.1f}, "
            f"TigerMigration={r.tiger_migration_probability:.1f}, "
            f"ZoonoticRisk={r.zoonotic_risk_index:.1f}, "
            f"PreyStress={r.prey_stress_index:.1f}"
        )

    hist_lines = "\n".join(fmt(r) for r in historical)
    proj_lines = "\n".join(fmt(r) for r in projections)

    return f"""You are an expert ecological and climate scientist analysing the Sundarbans delta ecosystem.

HISTORICAL DATA (2014–2023):
{hist_lines}

PROJECTED DATA (2024–2033):
{proj_lines}

All values are indices 0–100. Write a structured report with these sections:

## EXECUTIVE SUMMARY
## WHAT THE DATA TELLS US
## ECOLOGICAL IMPACTS
## HUMAN COMMUNITY RISKS
## CONSERVATION RECOMMENDATIONS
## OUTLOOK

Be specific, reference actual years and values. Give 5 concrete recommendations."""


@router.post("/generate")
def generate_report(payload: ReportRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=400, detail="GEMINI_API_KEY not set in .env file.")

    historical = (
        db.query(SimulationResult)
        .filter(SimulationResult.is_projection == False, SimulationResult.scenario == payload.scenario)
        .order_by(SimulationResult.year).all()
    )
    projections = (
        db.query(SimulationResult)
        .filter(SimulationResult.is_projection == True, SimulationResult.scenario == payload.scenario)
        .order_by(SimulationResult.year).all()
    )

    if not historical and not projections:
        raise HTTPException(status_code=404, detail="No simulation data found. Run simulation first.")

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(build_prompt(historical, projections))
        report_text = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    return {
        "report": report_text,
        "scenario": payload.scenario,
        "historical_years": len(historical),
        "projection_years": len(projections),
    }