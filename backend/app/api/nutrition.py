
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.patient_service import get_patient_profile_dict

from app.services.nutrition_engine import (
    generate_grocery_list,
    generate_nutrition_plan,
    get_substitutions,
    track_compliance,
)

router = APIRouter()

class CompliancePayload(BaseModel):
    adherence_percent: int

@router.get("/patients/{patient_id}/plan")
async def get_plan(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Generates and retrieves a personalized nutrition plan."""
    patient = await get_patient_profile_dict(patient_id, db)
    return generate_nutrition_plan(patient)

@router.get("/patients/{patient_id}/grocery")
async def get_grocery(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Generates grocery list based on active plan."""
    await get_patient_profile_dict(patient_id, db)
    return generate_grocery_list(patient_id)

@router.get("/food/{food_id}/substitutions")
async def get_food_substitutions(food_id: str):
    """Suggest alternatives for a specific food."""
    subs = get_substitutions(food_id)
    if not subs:
        raise HTTPException(status_code=404, detail="Food not found or no substitutions available.")
    return subs

@router.post("/patients/{patient_id}/compliance")
async def log_compliance(patient_id: str, payload: CompliancePayload, db: AsyncSession = Depends(get_db)):
    """Log meals and calculate adherence scores."""
    await get_patient_profile_dict(patient_id, db)
    return track_compliance(patient_id, payload.adherence_percent)
