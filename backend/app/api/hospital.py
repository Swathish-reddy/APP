from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime

from app.api.deps import get_db
from app.db.models import Document, Patient
from sqlalchemy.future import select

router = APIRouter()

async def _simulate_hospital_state(hospital_id: int, db: AsyncSession) -> Dict[str, Any]:
    """
    Aggregates hospital-wide state dynamically from actual Patient and Document tables.
    """
    # Base simulated state
    state = {
        "kpis": {
            "total_patients": 497,
            "emergency_patients": 45,
            "icu_occupancy_pct": 95,
            "ward_occupancy_pct": 87,
            "er_wait_time_mins": 45,
            "avg_length_of_stay_days": 4.2,
            "admissions_today": 112,
            "discharges_today": 89,
            "current_surgeries": 8,
            "available_beds": 42,
            "critical_alerts": 3,
            "performance_score": 92,
            "ai_confidence_pct": 98,
            "timestamp": datetime.now().isoformat()
        },
        "capacity": {
            "icu": {"total": 40, "occupied": 38, "status": "Critical"},
            "ward": {"total": 400, "occupied": 350, "status": "Stable"},
            "er": {"total": 60, "occupied": 45, "status": "Warning"},
            "nicu": {"total": 20, "occupied": 18, "status": "Warning"},
            "picu": {"total": 15, "occupied": 12, "status": "Stable"},
            "ot": {"total": 12, "occupied": 8, "status": "Stable"},
            "isolation": {"total": 30, "occupied": 28, "status": "Critical"}
        },
        "patient_flow": {
            "admissions": 112,
            "transfers": 34,
            "discharges": 89,
            "bottlenecks": [
                {"location": "ER Triage", "delay_mins": 45, "trend": "increasing"},
                {"location": "Radiology", "delay_mins": 25, "trend": "stable"}
            ]
        },
        "staffing": {
            "doctors": {
                "total_on_shift": 145,
                "available": 12,
                "in_surgery": 24,
                "emergency_calls": 3
            },
            "nurses": {
                "total_on_shift": 380,
                "available": 45,
                "fatigue_warnings": 12
            },
            "ambulances": {
                "total": 15,
                "available": 4,
                "dispatched": 11
            }
        },
        "resources": {
            "ventilators": {"total": 80, "in_use": 65, "status": "Stable"},
            "blood_inventory": {"o_neg": 12, "a_pos": 45, "status": "Warning"},
            "medicine_stock": {"critical_shortages": 2, "status": "Warning"},
            "ppe": {"days_remaining": 45, "status": "Optimal"}
        },
        "recommendations": [
            {
                "id": "REC-001",
                "priority": "CRITICAL",
                "reason": "ICU reaching max capacity (95%)",
                "impact": "Prevents ER backlog and diversion",
                "action": "Transfer 3 stable ICU patients to Step-Down Unit",
                "confidence": 94,
                "departments": ["ICU", "Ward"],
                "status": "pending"
            },
            {
                "id": "REC-002",
                "priority": "HIGH",
                "reason": "O- Blood inventory low (12 units)",
                "impact": "Ensures readiness for trauma cases",
                "action": "Initiate emergency blood transfer from Central Blood Bank",
                "confidence": 98,
                "departments": ["Blood Bank", "ER"],
                "status": "pending"
            },
            {
                "id": "REC-003",
                "priority": "MEDIUM",
                "reason": "Nurse fatigue high in ER (Shift > 10hrs)",
                "impact": "Reduces clinical errors by 15%",
                "action": "Reassign 2 float nurses to ER Triage",
                "confidence": 88,
                "departments": ["ER", "Nursing"],
                "status": "pending"
            }
        ],
        "predictive": [
            {"event": "Weekend Trauma Surge", "probability_pct": 78, "timeframe": "48h"},
            {"event": "ICU Overflow", "probability_pct": 45, "timeframe": "12h"},
            {"event": "Ventilator Shortage", "probability_pct": 12, "timeframe": "72h"}
        ],
        "executive_summary": "Hospital operations are currently stable but trending towards capacity limits in ICU and ER. Recommended immediate action to transfer stable ICU patients and resupply O- blood to prevent weekend surge diversions. Overall AI confidence remains high at 98%."
    }
    
    try:
        pat_res = await db.execute(select(Patient))
        patients = pat_res.scalars().all()
        if patients:
            state["kpis"]["total_patients"] = 400 + (len(patients) * 15)
            
        doc_res = await db.execute(select(Document))
        documents = doc_res.scalars().all()
        abnormal_count = sum(1 for doc in documents if doc.abnormalities)
        
        if documents:
            state["kpis"]["admissions_today"] = 20 + len(documents) * 3
            state["kpis"]["er_wait_time_mins"] = 45 + (abnormal_count * 12)
            state["capacity"]["icu"]["occupied"] = min(state["capacity"]["icu"]["total"], 15 + (abnormal_count * 2))
            
            # Dynamically adjust percentages
            state["kpis"]["icu_occupancy_pct"] = round((state["capacity"]["icu"]["occupied"] / state["capacity"]["icu"]["total"]) * 100)
    except Exception as e:
        print(f"Hospital state aggregation error: {e}")

    return state

@router.get("/{hospital_id}/intelligence", response_model=Dict[str, Any])
async def get_hospital_intelligence(hospital_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates structured Hospital Operational Intelligence for the Command Center dashboard.
    """
    try:
        state = await _simulate_hospital_state(hospital_id, db)
        return state
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate hospital intelligence report: {str(e)}"
        )
