from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.api.deps import get_db
from app.db.models import Patient
from sqlalchemy.future import select
from app.services.medication_engine import generate_medication_intelligence_report

router = APIRouter()

from app.db.models import HealthMetric, Document

async def _build_pharmacotherapy_baseline(patient_obj: Patient, db: AsyncSession) -> Dict[str, Any]:
    """
    Helper to convert Patient ORM to dictionary suitable for the Medication Center, enriching with reports.
    """
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_obj.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {"egfr": 45.0} # Baseline mock if no actual eGFR found
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
        print(f"Error enriching patient with documents in medications: {e}")

    from app.db.models import Medication
    meds_res = await db.execute(select(Medication).where(Medication.patient_id == patient_obj.patient_id))
    db_meds = [{"name": m.medicine_name, "dosage": f"{m.dosage} {m.frequency}"} for m in meds_res.scalars().all()]

    return {
        "patient_id": patient_obj.patient_id,
        "age": patient_obj.age or 46,
        "weight_kg": patient_obj.weight or 90.0,
        "labs": labs,
        "vitals": vitals,
        "medications": db_meds if db_meds else []
    }

@router.get("/{patient_id}/intelligence", response_model=Dict[str, Any])
async def get_medication_intelligence(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates the comprehensive 20-point Pharmacotherapy Intelligence report.
    Cross-references active prescriptions against lab values (like eGFR) and 
    checks for dangerous drug-drug interactions.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient medication information available (Patient Not Found)."
        )

    patient_dict = await _build_pharmacotherapy_baseline(patient_obj, db)

    try:
        report = generate_medication_intelligence_report(patient_dict)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate pharmacotherapy report: {str(e)}"
        )
