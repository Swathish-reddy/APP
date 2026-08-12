from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.services.insights_engine import AIInsightsEngine

router = APIRouter()

@router.get("/{patient_id}/summary", response_model=dict[str, Any])
async def get_patient_insights_summary(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves the comprehensive 18-point AI Insights report for a given patient.
    """
    engine = AIInsightsEngine(db)
    report = await engine.generate_clinical_report(patient_id)
    
    if "error" in report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=report["error"]
        )
        
    return report

@router.get("/{patient_id}/anomalies", response_model=dict[str, Any])
async def get_patient_anomalies(patient_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves only the critical alerts and anomalies for the patient.
    """
    engine = AIInsightsEngine(db)
    report = await engine.generate_clinical_report(patient_id)
    
    if "error" in report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=report["error"]
        )
        
    return {"alerts": report.get("14_alerts", [])}
