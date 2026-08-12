from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_db
from app.db.models import Patient
from app.services.whatif_simulator import run_comprehensive_simulation

router = APIRouter()

class WhatIfSimulationRequest(BaseModel):
    modified_params: dict[str, Any]

from app.db.models import Document, HealthMetric


async def _build_patient_dict(patient_obj: Patient, db: AsyncSession) -> dict[str, Any]:
    """Helper to convert Patient ORM to dictionary suitable for AI services, enriching with reports."""
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_obj.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {"hba1c": 7.4, "cholesterol_ldl": 110}
    vitals = {"systolic_bp": 145, "diastolic_bp": 90, "spo2": 89}
    
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
        print(f"Error enriching patient with documents in whatif: {e}")

    return {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "vitals": vitals,
        "labs": labs,
        "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
        "bmi": patient_obj.bmi or 26.8,
        "active_medications": []
    }

@router.post("/{patient_id}/simulate", response_model=dict[str, Any])
async def simulate_what_if_scenario(patient_id: int, req: WhatIfSimulationRequest, db: AsyncSession = Depends(get_db)):
    """
    Executes a comprehensive 20-point What-If simulation.
    Calculates biological age shifts, life expectancy changes, and financial impact.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient clinical data available for accurate simulation."
        )

    patient_dict = await _build_patient_dict(patient_obj, db)

    try:
        simulation_result = run_comprehensive_simulation(patient_dict, req.modified_params)
        return simulation_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute simulation: {e!s}"
        )
