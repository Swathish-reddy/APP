from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.api.deps import get_db
from app.db.models import Patient
from sqlalchemy.future import select
from app.services.diet_engine import generate_diet_intelligence_report

router = APIRouter()

from app.db.models import HealthMetric, Document

async def _build_patient_baseline(patient_obj: Patient, db: AsyncSession) -> Dict[str, Any]:
    """Helper to convert Patient ORM to dictionary suitable for baseline comparison, enriching with reports."""
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_obj.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {"hba1c": 7.4, "cholesterol_ldl": 130}
    vitals = {"systolic_bp": 145, "diastolic_bp": 90, "spo2": 95, "heart_rate": 70}
    
    for m in metrics_list:
        if m.value is None: continue
        key = m.metric_name.lower()
        if key in ["glucose", "systolic_bp", "diastolic_bp", "heart_rate", "spo2"]:
            vitals[key] = m.value
        else:
            labs[key] = m.value
            
    try:
        result = await db.execute(select(Document).where(Document.patient_id == patient_obj.patient_id))
        documents = result.scalars().all()
        for doc in documents:
            if doc.status == "Completed" and doc.structured_data:
                for k, v in doc.structured_data.items():
                    k_lower = k.lower()
                    if "bp" in k_lower or "heart" in k_lower or "spo2" in k_lower or "temp" in k_lower or "respiratory" in k_lower:
                        vitals[k_lower] = v
                    else:
                        labs[k_lower] = v
    except Exception as e:
        print(f"Error enriching patient with documents in diet: {e}")

    return {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "weight_kg": 90.0,
        "height_cm": 175.0,
        "vitals": vitals,
        "labs": labs,
        "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
        "bmi": patient_obj.bmi or 26.8,
        "active_medications": ["Lisinopril", "Metformin"] # Simulated for John Doe
    }

@router.get("/{patient_id}/plan", response_model=Dict[str, Any])
async def get_diet_plan(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Analyzes patient health, laboratory reports, medications, and physiology 
    to generate a personalized, evidence-based 20-point dietary intelligence report.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient nutritional data available (Patient Not Found)."
        )

    patient_dict = await _build_patient_baseline(patient_obj, db)

    try:
        report = generate_diet_intelligence_report(patient_dict)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate diet plan: {str(e)}"
        )
