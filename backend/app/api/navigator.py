
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

from app.services.patient_service import get_patient_profile_dict
from app.services.care_navigator import (
    book_appointment,
    calculate_doctor_match,
    calculate_hospital_match,
    generate_care_pathway,
    get_appointments,
    get_diagnostic_centers,
    get_referrals,
)

router = APIRouter()

class AppointmentPayload(BaseModel):
    provider_id: str
    type: str
    date: str

@router.get("/patients/{patient_id}/recommendations")
async def get_recommendations(patient_id: str, db: AsyncSession = Depends(get_db)):
    patient = await get_patient_profile_dict(patient_id, db)
    return {
        "doctors": calculate_doctor_match(patient),
        "hospitals": calculate_hospital_match(patient),
        "diagnostic_centers": get_diagnostic_centers(patient)
    }

@router.get("/patients/{patient_id}/pathway")
async def get_pathway(patient_id: str, db: AsyncSession = Depends(get_db)):
    patient = await get_patient_profile_dict(patient_id, db)
    return generate_care_pathway(patient_id, patient)

@router.get("/patients/{patient_id}/appointments")
async def list_appointments(patient_id: str, db: AsyncSession = Depends(get_db)):
    await get_patient_profile_dict(patient_id, db)
    return get_appointments(patient_id)

@router.post("/patients/{patient_id}/appointments")
async def create_appointment(patient_id: str, payload: AppointmentPayload, db: AsyncSession = Depends(get_db)):
    await get_patient_profile_dict(patient_id, db)
    return book_appointment(patient_id, payload.provider_id, payload.type, payload.date)

@router.get("/patients/{patient_id}/referrals")
async def list_referrals(patient_id: str, db: AsyncSession = Depends(get_db)):
    await get_patient_profile_dict(patient_id, db)
    return get_referrals(patient_id)
