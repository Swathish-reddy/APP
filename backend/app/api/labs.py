from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from pydantic import BaseModel

from app.api.deps import get_db
from app.db.models import Patient
from sqlalchemy.future import select
from app.services.lab_analysis_engine import generate_lab_report

router = APIRouter()

class LabResultPayload(BaseModel):
    lab_results: Dict[str, float]

def _build_patient_baseline(patient_obj: Patient) -> Dict[str, Any]:
    """Helper to convert Patient ORM to dictionary suitable for baseline comparison."""
    return {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "vitals": {"systolic_bp": 120, "diastolic_bp": 80, "spo2": 98, "heart_rate": 70},
        "labs": {"hba1c": 5.4, "cholesterol_ldl": 100},
        "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
        "bmi": patient_obj.bmi or 24.0,
        "active_medications": []
    }

@router.post("/{patient_id}/analyze", response_model=Dict[str, Any])
async def analyze_laboratory_report(patient_id: int, req: LabResultPayload, db: AsyncSession = Depends(get_db)):
    """
    Ingests raw laboratory results (e.g., from OCR or FHIR).
    Maps them against clinical reference ranges, classifies severity, and generates an 18-point intelligence report.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient laboratory data available (Patient Not Found)."
        )

    patient_dict = _build_patient_baseline(patient_obj)

    try:
        report = generate_lab_report(patient_dict, req.lab_results)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process laboratory report: {str(e)}"
        )
