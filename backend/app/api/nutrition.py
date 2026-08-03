from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from app.db.db import patients_db
from app.services.nutrition_engine import (
    generate_nutrition_plan,
    generate_grocery_list,
    get_substitutions,
    track_compliance
)

router = APIRouter()

class CompliancePayload(BaseModel):
    adherence_percent: int

@router.get("/patients/{patient_id}/plan")
def get_plan(patient_id: str):
    """Generates and retrieves a personalized nutrition plan."""
    if not patient_id.startswith("P"):
        patient_id = f"P10{patient_id}"
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient = patients_db[patient_id]
    return generate_nutrition_plan(patient)

@router.get("/patients/{patient_id}/grocery")
def get_grocery(patient_id: str):
    """Generates grocery list based on active plan."""
    if not patient_id.startswith("P"):
        patient_id = f"P10{patient_id}"
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return generate_grocery_list(patient_id)

@router.get("/food/{food_id}/substitutions")
def get_food_substitutions(food_id: str):
    """Suggest alternatives for a specific food."""
    subs = get_substitutions(food_id)
    if not subs:
        raise HTTPException(status_code=404, detail="Food not found or no substitutions available.")
    return subs

@router.post("/patients/{patient_id}/compliance")
def log_compliance(patient_id: str, payload: CompliancePayload):
    """Log meals and calculate adherence scores."""
    if not patient_id.startswith("P"):
        patient_id = f"P10{patient_id}"
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return track_compliance(patient_id, payload.adherence_percent)
