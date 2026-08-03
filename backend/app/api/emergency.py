from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from pydantic import BaseModel
import random

from app.api.deps import get_db
from app.db.models import Patient, HealthMetric, Document
from sqlalchemy.future import select
from app.services.emergency_engine import generate_emergency_intelligence_report

router = APIRouter()

class EmergencyPayload(BaseModel):
    vitals: Optional[Dict[str, float]] = None
    labs: Optional[Dict[str, float]] = None

async def _build_emergency_baseline(patient_obj: Patient, db: AsyncSession) -> Dict[str, Any]:
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
            
    return {
        "patient_id": patient_obj.patient_id,
        "name": patient_obj.name,
        "age": patient_obj.age or 45,
        "gender": patient_obj.gender,
        "allergies": "Penicillin",
        "baseline_vitals": vitals,
        "baseline_labs": labs
    }

@router.get("/active-cases", response_model=Dict[str, Any])
async def get_active_emergency_cases():
    """Returns a mock list of active cases in the Emergency Department queue."""
    return {
        "critical": [
            {"id": "P3", "name": "Emily Chen", "age": 42, "reason": "Suspected Sepsis", "triage": "ESI-1", "time_in": "12 min ago"},
            {"id": "P7", "name": "Robert Taylor", "age": 68, "reason": "STEMI (Heart Attack)", "triage": "ESI-1", "time_in": "4 min ago"}
        ],
        "waiting": [
            {"id": "P1", "name": "John Doe", "age": 45, "reason": "Severe Abdominal Pain", "triage": "ESI-3", "time_in": "45 min ago"},
            {"id": "P5", "name": "Michael Brown", "age": 55, "reason": "Head Trauma (Fall)", "triage": "ESI-2", "time_in": "20 min ago"}
        ],
        "incoming": [
            {"id": "AMB-104", "type": "Ambulance", "eta": "5 mins", "reason": "Stroke Code"}
        ]
    }

@router.get("/capacity", response_model=Dict[str, Any])
async def get_hospital_capacity():
    """Returns real-time simulated hospital resource capacities for the EOC."""
    return {
        "icu_beds": {"total": 40, "occupied": 38, "status": "Critical"},
        "er_beds": {"total": 25, "occupied": 20, "status": "Warning"},
        "ventilators": {"total": 50, "occupied": 12, "status": "Stable"},
        "blood_units": {"o_neg": 15, "a_pos": 40, "b_pos": 22},
        "on_call_specialists": [
            {"name": "Dr. Sarah Jenkins", "specialty": "Trauma Surgery", "status": "In OR"},
            {"name": "Dr. Marcus Wei", "specialty": "Cardiology", "status": "Available"}
        ],
        "ambulances": {"total": 12, "dispatched": 8, "available": 4}
    }

@router.post("/{patient_id}/triage", response_model=Dict[str, Any])
async def trigger_emergency_triage(patient_id: int, req: EmergencyPayload, db: AsyncSession = Depends(get_db)):
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient Not Found."
        )

    patient_dict = await _build_emergency_baseline(patient_obj, db)

    # Generate live telemetry if none provided
    vitals = req.vitals if req.vitals else {
        "heart_rate": random.randint(110, 140),
        "systolic_bp": random.randint(80, 100),
        "diastolic_bp": random.randint(50, 65),
        "spo2": random.randint(88, 94),
        "respiratory_rate": random.randint(22, 28),
        "temperature": random.uniform(38.5, 39.5)
    }
    
    labs = req.labs if req.labs else {
        "lactate": random.uniform(4.1, 6.5),
        "wbc": random.uniform(15.0, 22.0),
        "troponin": random.uniform(0.01, 0.04)
    }

    try:
        report = generate_emergency_intelligence_report(patient_dict, {"vitals": vitals, "labs": labs})
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process emergency triage: {str(e)}"
        )

@router.get("/doctors/recommend", response_model=Dict[str, Any])
async def recommend_doctors(emergency_type: str = "General"):
    """Recommends doctors for the emergency based on specialization and availability."""
    doctors = [
        {"id": "D1", "name": "Dr. Sarah Jenkins", "specialty": "Trauma Surgery", "status": "Available", "eta": "2 mins", "rating": 4.9, "experience": "12 years", "image": "https://i.pravatar.cc/150?u=sarah"},
        {"id": "D2", "name": "Dr. Marcus Wei", "specialty": "Cardiology", "status": "Available", "eta": "5 mins", "rating": 4.8, "experience": "15 years", "image": "https://i.pravatar.cc/150?u=marcus"},
        {"id": "D3", "name": "Dr. Elena Rodriguez", "specialty": "Neurology", "status": "In Consult", "eta": "15 mins", "rating": 4.7, "experience": "9 years", "image": "https://i.pravatar.cc/150?u=elena"}
    ]
    # Simple mock filter
    if "cardio" in emergency_type.lower() or "heart" in emergency_type.lower():
        doctors = [d for d in doctors if d["specialty"] == "Cardiology"]
    return {"recommended": doctors}

@router.get("/action-plan/{patient_id}", response_model=Dict[str, Any])
async def generate_action_plan(patient_id: str):
    """Generates a dynamic emergency action plan for a specific patient."""
    return {
        "immediate_actions": ["Administer Oxygen 15L/min", "Establish 2x Large Bore IVs", "12-Lead ECG"],
        "medications": ["Aspirin 300mg PO", "Ticagrelor 180mg PO", "Morphine 2.5mg IV PRN"],
        "equipment": ["Defibrillator on standby", "Crash Cart"],
        "required_specialists": ["Cardiologist on call"],
        "monitoring": "Continuous telemetry, BP every 5 mins",
        "reasoning": "Symptoms and vitals indicate high probability of ACS (Acute Coronary Syndrome). Immediate medical therapy and monitoring required to prevent myocardial damage."
    }

@router.get("/map-data", response_model=Dict[str, Any])
async def get_emergency_map_data():
    """Provides live data for the emergency map (ambulances, traffic, hospitals)."""
    return {
        "ambulances": [
            {"id": "AMB-104", "lat": 40.7128, "lng": -74.0060, "status": "En Route", "eta": "5 mins", "patient_criticality": "High"},
            {"id": "AMB-211", "lat": 40.7500, "lng": -73.9900, "status": "Returning", "eta": "12 mins", "patient_criticality": "Low"}
        ],
        "hospitals": [
            {"id": "H1", "name": "Central General (Here)", "lat": 40.7300, "lng": -73.9950, "trauma_level": 1, "status": "Accepting"},
            {"id": "H2", "name": "Westside Medical", "lat": 40.7400, "lng": -74.0100, "trauma_level": 2, "status": "Diversion"}
        ]
    }

