from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.patient_service import get_patient_profile_dict

from app.services.agents import run_agent_consensus
from app.services.population_engine import (
    compute_disease_surveillance,
    compute_operations_metrics,
    compute_outcome_analytics,
    compute_population_analytics,
    match_clinical_trials,
)

router = APIRouter()


@router.get("/analytics")
async def get_population_analytics(db: AsyncSession = Depends(get_db)):
    """Full population health analytics dashboard."""
    return await compute_population_analytics(db)


@router.get("/surveillance")
async def get_disease_surveillance(db: AsyncSession = Depends(get_db)):
    """Disease surveillance signals and trend series."""
    return await compute_disease_surveillance(db)


@router.get("/operations")
def get_operations_metrics():
    """Healthcare operations KPIs: bed utilization, ICU capacity, wait times."""
    return compute_operations_metrics()


@router.get("/outcomes")
async def get_outcome_analytics(db: AsyncSession = Depends(get_db)):
    """Treatment effectiveness and readmission outcome analytics."""
    return await compute_outcome_analytics(db)


@router.get("/patients/{patient_id}/trial-matching")
async def get_trial_matching(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Match a patient to relevant clinical trials."""
    patient = await get_patient_profile_dict(patient_id, db)
    return {"trials": match_clinical_trials(patient_id, patient)}


@router.get("/patients/{patient_id}/agents")
async def get_agent_consensus(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Run all 7 specialized AI agents and return their consensus."""
    patient = await get_patient_profile_dict(patient_id, db)
    return run_agent_consensus(patient)
