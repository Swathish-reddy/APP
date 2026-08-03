from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from app.db.db import patients_db
from app.services.care_navigator import (
    calculate_doctor_match,
    calculate_hospital_match,
    get_diagnostic_centers,
    generate_care_pathway,
    book_appointment,
    get_appointments,
    get_referrals
)

router = APIRouter()

class AppointmentPayload(BaseModel):
    provider_id: str
    type: str
    date: str

@router.get("/patients/{patient_id}/recommendations")
def get_recommendations(patient_id: str):
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient = patients_db[patient_id]
    return {
        "doctors": calculate_doctor_match(patient),
        "hospitals": calculate_hospital_match(patient),
        "diagnostic_centers": get_diagnostic_centers(patient)
    }

@router.get("/patients/{patient_id}/pathway")
def get_pathway(patient_id: str):
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient = patients_db[patient_id]
    return generate_care_pathway(patient_id, patient)

@router.get("/patients/{patient_id}/appointments")
def list_appointments(patient_id: str):
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return get_appointments(patient_id)

@router.post("/patients/{patient_id}/appointments")
def create_appointment(patient_id: str, payload: AppointmentPayload):
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return book_appointment(patient_id, payload.provider_id, payload.type, payload.date)

@router.get("/patients/{patient_id}/referrals")
def list_referrals(patient_id: str):
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return get_referrals(patient_id)
