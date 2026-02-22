from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import google.generativeai as genai

from app.db.database import get_db
from app.models.simulation import SimulationResult
from app.core.config import settings

router = APIRouter(prefix="/report", tags=["report"])


class ReportRequest(BaseModel):
    scenario: str = "baseline"


def build_prompt(historical: list, projections: list) -> str:
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

    return f"""You are an expert ecological and climate scientist analysing the Sundarbans delta ecosystem (India-Bangladesh border).

Below are 20 years of simulation output from the AETHERA cascade model. All values are indices from 0 to 100.

HISTORICAL DATA (2014-2023):
{hist_lines}

PROJECTED DATA (2024-2033, baseline scenario):
{proj_lines}

INDEX DEFINITIONS:
- FloodRisk: Composite of temperature, rainfall, and glacier melt contribution
- GlacierAmp: Himalayan glacier melt amplification feeding into sea-level and flood risk
- PreyMigration: Probability that prey species (deer, wild boar, macaque) are displaced
- TigerMigration: Bengal tiger secondary displacement driven by prey movement
- ZoonoticRisk: Human-wildlife interface exposure index (NOT disease prediction)
- PreyStress: Habitat stress from vegetation loss, flooding, and saltwater intrusion

Write a structured scientific report using EXACTLY these section headers with no extra formatting:

## EXECUTIVE SUMMARY
Two to three sentences summarising the key trend across the 20-year window.

## WHAT THE DATA TELLS US
Explain the cascade chain referencing specific years where trends accelerate.

## ECOLOGICAL IMPACTS
Describe what is happening to the Bengal tiger population and prey species. Be specific about 2023 versus 2033.

## HUMAN COMMUNITY RISKS
Explain risks to fishing and farming communities in the delta. Reference the zoonotic index trend.

## CONSERVATION RECOMMENDATIONS
Give 5 concrete actionable recommendations numbered 1 through 5.

## OUTLOOK
A frank closing paragraph on the trajectory if no action is taken and the best-case if recommendations are implemented.

Use plain text only inside each section. No bullet symbols, no asterisks, no bold markers. Just clean paragraphs and numbered lists."""


@router.post("/generate")
def generate_report(payload: ReportRequest, db: Session = Depends(get_db)):
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "AIzaSyC9wZqv_eyBqYr8aXCCoWNcEkbfhcuCEXw":
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY not set in backend/.env file. Add your Google AI Studio key."
        )

    historical = (
        db.query(SimulationResult)
        .filter(
            SimulationResult.is_projection == False,
            SimulationResult.scenario == payload.scenario
        )
        .order_by(SimulationResult.year)
        .all()
    )
    projections = (
        db.query(SimulationResult)
        .filter(
            SimulationResult.is_projection == True,
            SimulationResult.scenario == payload.scenario
        )
        .order_by(SimulationResult.year)
        .all()
    )

    if not historical and not projections:
        raise HTTPException(
            status_code=404,
            detail="No simulation data found. Run POST /api/analysis/run-all first."
        )

    prompt = build_prompt(historical, projections)

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5")
        response = model.generate_content(prompt)
        report_text = response.text
    except Exception as e:
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or "API key" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Gemini API key. Check your .env file.")
        if "quota" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="Gemini rate limit hit. Wait a moment and try again.")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {error_msg}")

    return {
        "report": report_text,
        "scenario": payload.scenario,
        "historical_years": len(historical),
        "projection_years": len(projections),
    }

