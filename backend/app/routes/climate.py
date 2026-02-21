from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.climate import ClimateData
from app.schemas.climate import ClimateDataCreate, ClimateDataOut

router = APIRouter(prefix="/climate", tags=["climate"])


@router.get("/", response_model=List[ClimateDataOut])
def get_all_climate(db: Session = Depends(get_db)):
    return db.query(ClimateData).order_by(ClimateData.year).all()


@router.get("/{year}", response_model=ClimateDataOut)
def get_climate_by_year(year: int, db: Session = Depends(get_db)):
    record = db.query(ClimateData).filter(ClimateData.year == year).first()
    if not record:
        raise HTTPException(status_code=404, detail="Year not found")
    return record


@router.post("/", response_model=ClimateDataOut)
def create_climate_record(payload: ClimateDataCreate, db: Session = Depends(get_db)):
    record = ClimateData(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
