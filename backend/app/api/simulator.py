from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Patient, SimulationScenario
from app.db.session import get_db
from app.services.simulator import run_heuristic_simulation

router = APIRouter()

@router.post("/patient/{patient_id}/run")
async def run_simulation(patient_id: int, modifiers: dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Runs a temporary what-if simulation"""
    res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    if not res.scalars().first():
        raise HTTPException(status_code=404, detail="Patient not found")
        
    result = await run_heuristic_simulation(patient_id, modifiers, db)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result

@router.post("/patient/{patient_id}/save")
async def save_scenario(patient_id: int, payload: dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Saves a simulation scenario to the database"""
    scenario = SimulationScenario(
        patient_id=patient_id,
        scenario_name=payload.get("scenario_name", "Custom Scenario"),
        modifiers=payload.get("modifiers", {}),
        projected_health_score=payload.get("projected_health_score", 0),
        projected_biological_age=payload.get("projected_biological_age", 0),
        xai_insights=payload.get("xai_insights", [])
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return {"message": "Scenario saved successfully", "scenario": scenario}

@router.get("/patient/{patient_id}/history")
async def get_simulation_history(patient_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SimulationScenario).where(SimulationScenario.patient_id == patient_id).order_by(SimulationScenario.created_at.desc()))
    return res.scalars().all()
