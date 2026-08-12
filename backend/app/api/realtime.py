from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_db
from app.db.models import Patient
from app.services.realtime_monitor import generate_realtime_report

router = APIRouter()

class TelemetryPayload(BaseModel):
    live_data: dict[str, Any]

from app.db.models import Document, HealthMetric


async def _build_patient_baseline(patient_obj: Patient, db: AsyncSession) -> dict[str, Any]:
    """Helper to convert Patient ORM to dictionary suitable for baseline comparison, enriching with reports."""
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_obj.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {"hba1c": 5.4, "cholesterol_ldl": 100}
    vitals = {"systolic_bp": 120, "diastolic_bp": 80, "spo2": 98, "heart_rate": 70}
    
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
        print(f"Error enriching patient with documents in realtime: {e}")

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

@router.post("/{patient_id}/ingest", response_model=dict[str, Any])
async def ingest_live_telemetry(patient_id: int, req: TelemetryPayload, db: AsyncSession = Depends(get_db)):
    """
    Ingests a live telemetry payload (from IoT/Wearable).
    Instantly runs anomaly detection against the patient's baseline and generates an 18-point evaluation.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Real-time monitoring data unavailable (Patient Not Found)."
        )

    patient_baseline = await _build_patient_baseline(patient_obj, db)

    try:
        report = generate_realtime_report(patient_baseline, req.live_data)
        
        # Simulate asynchronous alert dispatch (e.g. firing WebSockets or Push Notifications) if status is Critical
        if report["2_live_monitoring_status"]["status"] == "Critical":
            # In a production app, this would trigger a Celery task or broadcast to a Redis Pub/Sub channel
            pass
            
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process live telemetry: {e!s}"
        )
