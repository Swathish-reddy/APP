from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_current_user, get_db
from app.db.models import Patient, User
from app.services.overview_engine import (
    generate_hospital_overview_report,
    generate_patient_overview_report,
)

router = APIRouter()

@router.get("/patient/{patient_id}", response_model=dict[str, Any])
async def get_patient_overview(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Acts as the master Home Dashboard endpoint for a specific patient.
    Aggregates top-level summaries from the Medication, Diet, and CDSS engines.
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient_obj = pat_res.scalars().first()
    
    if not patient_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found."
        )

    try:
        report = await generate_patient_overview_report(patient_id, db)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate unified patient overview: {e!s}"
        )


@router.get("/hospital/{hospital_id}", response_model=dict[str, Any])
async def get_hospital_overview(
    hospital_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Acts as the master Command Center endpoint for hospital administrators.
    Aggregates top-level summaries from the ER, Analytics, and Hospital Ops engines.
    """
    # Verify Admin or Doctor access
    if current_user.role not in ["ADMIN", "DOCTOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Administrator or Doctor authorization required."
        )

    try:
        report = generate_hospital_overview_report(hospital_id)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate unified hospital overview: {e!s}"
        )
