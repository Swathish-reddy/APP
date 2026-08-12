from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_db
from app.db.models import Patient
from app.services.xai_engine import generate_full_explanation

router = APIRouter()

@router.get("/{patient_id}/explain", response_model=dict[str, Any])
async def get_patient_explanation(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves the comprehensive 20-point XAI report for a given patient.
    Provides SHAP, LIME, Bias detection, and translated explanations.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient clinical data available."
        )

    # Convert Patient ORM to dictionary for AI services (placeholder mapping)
    patient_dict = {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "vitals": {"systolic_bp": 120, "diastolic_bp": 80, "spo2": 98},
        "labs": {"hba1c": 5.4, "cholesterol_ldl": 100},
        "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
        "bmi": patient_obj.bmi or 24.0,
        "active_medications": []
    }

    try:
        report = generate_full_explanation(patient_dict)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate XAI explanation: {e!s}"
        )
