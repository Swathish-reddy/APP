
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.services.clinical_risk_engine import (
    generate_organ_risk_scores,
    run_multi_model_fusion,
)
from app.services.explainable_ai import get_xai_report
from app.services.patient_service import get_patient_profile_dict

router = APIRouter()

@router.get("/{patient_id}/fusion")
async def get_risk_fusion(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the comprehensive clinical risk intelligence report for a patient.
    """
    patient_dict = await get_patient_profile_dict(str(patient_id), db)
    result = run_multi_model_fusion(patient_dict)
    return result

@router.get("/{patient_id}/organ-risks")
async def get_organ_risks(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a quick 0-100 risk score breakdown for major organs.
    """
    patient_dict = await get_patient_profile_dict(str(patient_id), db)
    return generate_organ_risk_scores(patient_dict)

@router.get("/{patient_id}/xai/{disease_name}")
async def get_prediction_xai(patient_id: int, disease_name: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieves Explainable AI for a specific disease prediction.
    """
    patient_dict = await get_patient_profile_dict(str(patient_id), db)
    
    mapping = {
        "cv": "Cardiovascular Risk",
        "diabetes": "Diabetes Risk",
        "kidney": "Kidney Disease Risk",
        "liver": "Liver Disease Risk",
        "respiratory": "Respiratory Risk",
        "neuro": "Neurological Risk"
    }
    
    actual_name = mapping.get(disease_name.lower(), disease_name)
    return get_xai_report(actual_name, patient_dict)

@router.get("/patient/{patient_id}/predict")
async def get_patient_predict(patient_id: int, disease: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Predicts risk for a specific disease and returns XAI.
    """
    patient_dict = await get_patient_profile_dict(str(patient_id), db)
    
    mapping = {
        "cv": "Cardiovascular Risk",
        "cardiovascular_disease": "Cardiovascular Risk",
        "diabetes": "Diabetes Risk",
        "kidney": "Kidney Disease Risk",
        "liver": "Liver Disease Risk",
        "respiratory": "Respiratory Risk",
        "neuro": "Neurological Risk"
    }
    
    actual_name = mapping.get(disease.lower(), disease)
    xai_data = get_xai_report(actual_name, patient_dict)
    
    fusion = run_multi_model_fusion(patient_dict)
    predictions = fusion.get("predictions", [])
    
    disease_info = {"risk_percent": 50.0, "confidence_score": 80.0}
    for p in predictions:
        if p.get("disease") == actual_name:
            disease_info = p
            break
    
    return {
        "disease": actual_name,
        "risk_score": disease_info["risk_percent"],
        "confidence": disease_info["confidence_score"],
        "xai": xai_data
    }
