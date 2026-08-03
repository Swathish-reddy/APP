from fastapi import APIRouter, HTTPException
from app.db.db import patients_db
from app.services.population_engine import (
    compute_population_analytics,
    compute_disease_surveillance,
    compute_operations_metrics,
    match_clinical_trials,
    compute_outcome_analytics,
)
from app.services.agents import run_agent_consensus

router = APIRouter()


@router.get("/analytics")
def get_population_analytics():
    """Full population health analytics dashboard."""
    return compute_population_analytics()


@router.get("/surveillance")
def get_disease_surveillance():
    """Disease surveillance signals and trend series."""
    return compute_disease_surveillance()


@router.get("/operations")
def get_operations_metrics():
    """Healthcare operations KPIs: bed utilization, ICU capacity, wait times."""
    return compute_operations_metrics()


@router.get("/outcomes")
def get_outcome_analytics():
    """Treatment effectiveness and readmission outcome analytics."""
    return compute_outcome_analytics()


@router.get("/patients/{patient_id}/trial-matching")
def get_trial_matching(patient_id: str):
    """Match a patient to relevant clinical trials."""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"trials": match_clinical_trials(patient_id)}


@router.get("/patients/{patient_id}/agents")
def get_agent_consensus(patient_id: str):
    """Run all 7 specialized AI agents and return their consensus."""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return run_agent_consensus(patient_id)
