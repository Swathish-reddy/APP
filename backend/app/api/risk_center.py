from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_db
from app.db.models import Patient
from app.services.clinical_risk_engine import (
    generate_disease_risk_report,
    simulate_what_if,
)

router = APIRouter()

class SimulationRequest(BaseModel):
    modified_params: dict[str, Any]

from app.db.models import Document, HealthMetric


async def _build_patient_dict(patient_obj: Patient, db: AsyncSession) -> dict[str, Any]:
    """Helper to convert Patient ORM to dictionary suitable for AI services, enriching with reports."""
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_obj.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {}
    vitals = {}
    
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
        print(f"Error enriching patient with documents in risk_center: {e}")

    return {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "vitals": vitals,
        "labs": labs,
        "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
        "bmi": patient_obj.bmi or 24.0,
        "active_medications": []
    }

@router.get("/{patient_id}/report", response_model=dict[str, Any])
async def get_disease_risk_report(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves the comprehensive 20-point Disease Risk report for a given patient.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient clinical data available."
        )

    patient_dict = await _build_patient_dict(patient_obj, db)

    try:
        report = generate_disease_risk_report(patient_dict)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Risk report: {e!s}"
        )

@router.post("/{patient_id}/simulate", response_model=dict[str, Any])
async def simulate_risk(patient_id: int, req: SimulationRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulates disease risk if certain parameters (e.g., BMI, BP) are modified.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient clinical data available."
        )

    patient_dict = await _build_patient_dict(patient_obj, db)

    try:
        simulation_result = simulate_what_if(patient_dict, req.modified_params)
        return simulation_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run simulation: {e!s}"
        )
