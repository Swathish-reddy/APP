from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.db.models import Patient, HealthMetric, User
from app.api.deps import get_current_user
from app.services.clinical_risk_engine import run_multi_model_fusion, generate_organ_risk_scores
from app.services.explainable_ai import get_xai_report

router = APIRouter()

from app.db.models import Document

async def build_patient_dict(patient: Patient, db: AsyncSession) -> Dict[str, Any]:
    metrics_result = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient.patient_id))
    metrics_list = metrics_result.scalars().all()
    
    labs = {}
    vitals = {}
    
    for m in metrics_list:
        if m.value is None:
            continue
        key = m.metric_name.lower()
        if key in ["glucose", "systolic_bp", "diastolic_bp", "heart_rate", "spo2", "temperature", "respiratory_rate"]:
            vitals[key] = m.value
        else:
            labs[key] = m.value
            
    # Enrich with uploaded documents
    try:
        result = await db.execute(select(Document).where(Document.patient_id == patient.patient_id))
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
        print(f"Error enriching patient with documents in risk: {e}")

    # Fetch Medical History, Medications, and Allergies
    from app.db.models import MedicalHistory, Medication, Allergy
    med_hist_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == patient.patient_id))
    med_hist = [{"disease_name": h.disease_name, "status": h.status} for h in med_hist_res.scalars().all()]
    
    meds_res = await db.execute(select(Medication).where(Medication.patient_id == patient.patient_id))
    meds = [{"medicine_name": m.medicine_name, "dosage": m.dosage} for m in meds_res.scalars().all()]
    
    algs_res = await db.execute(select(Allergy).where(Allergy.patient_id == patient.patient_id))
    allergies = [{"allergen": a.allergen, "severity": a.severity} for a in algs_res.scalars().all()]

    return {
        "age": patient.age or 45,
        "bmi": patient.bmi or 24,
        "gender": patient.gender,
        "labs": labs,
        "vitals": vitals,
        "medical_history": med_hist,
        "medications": meds,
        "allergies": allergies
    }

@router.get("/{patient_id}/fusion")
async def get_risk_fusion(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the comprehensive clinical risk intelligence report for a patient.
    """
    result_pat = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    patient = result_pat.scalars().first()
    
    if patient:
        patient_dict = await build_patient_dict(patient, db)
    else:
        from app.db.db import patients_db
        mock_id = f"P{patient_id}"
        if mock_id in patients_db:
            patient_dict = patients_db[mock_id]
        else:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    result = run_multi_model_fusion(patient_dict)
    return result

@router.get("/{patient_id}/organ-risks")
async def get_organ_risks(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a quick 0-100 risk score breakdown for major organs.
    """
    result_pat = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    patient = result_pat.scalars().first()
    
    if patient:
        patient_dict = await build_patient_dict(patient, db)
    else:
        from app.db.db import patients_db
        mock_id = f"P{patient_id}"
        if mock_id in patients_db:
            patient_dict = patients_db[mock_id]
        else:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
            
    return generate_organ_risk_scores(patient_dict)

@router.get("/{patient_id}/xai/{disease_name}")
async def get_prediction_xai(patient_id: int, disease_name: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieves Explainable AI for a specific disease prediction.
    """
    result_pat = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    patient = result_pat.scalars().first()
    
    if patient:
        patient_dict = await build_patient_dict(patient, db)
    else:
        from app.db.db import patients_db
        mock_id = f"P{patient_id}"
        if mock_id in patients_db:
            patient_dict = patients_db[mock_id]
        else:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
    
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
    result_pat = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    patient = result_pat.scalars().first()
    
    if patient:
        patient_dict = await build_patient_dict(patient, db)
    else:
        from app.db.db import patients_db
        mock_id = f"P{patient_id}"
        if mock_id in patients_db:
            patient_dict = patients_db[mock_id]
        else:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
    
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
