
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Document
from app.db.session import get_db
from app.services.patient_service import get_patient_profile_dict
from app.services.chatbot import query_chatbot
from app.services.fusion import run_ai_fusion
from app.services.report_generator import (
    generate_clinical_report,
    generate_executive_report,
    generate_patient_report,
)
from app.services.xai_engine import (
    compute_counterfactual,
    compute_shap_analysis,
    generate_reasoning_chain,
    get_evidence_links,
)

router = APIRouter()

class ChatPayload(BaseModel):
    message: str
    mode: str | None = "patient"  # "patient" | "clinician"
    history: list | None = []

async def get_enriched_patient(patient_id: str, db: AsyncSession):
    patient = await get_patient_profile_dict(patient_id, db)
    
    try:
        pid_int = int(patient_id.replace("P", ""))
        result = await db.execute(select(Document).where(Document.patient_id == pid_int))
        documents = result.scalars().all()
        
        reports_data = []
        for doc in documents:
            if doc.status == "Completed":
                reports_data.append({
                    "id": doc.id,
                    "category": doc.category,
                    "report_type": doc.report_type,
                    "structured_data": doc.structured_data,
                    "abnormalities": doc.abnormalities,
                    "ai_summary": doc.ai_summary
                })
                
                # Merge structured data into labs/vitals if applicable
                if doc.structured_data:
                    for k, v in doc.structured_data.items():
                        k_lower = k.lower()
                        if "bp" in k_lower or "heart" in k_lower or "spo2" in k_lower or "temp" in k_lower or "respiratory" in k_lower:
                            if "vitals" not in patient: patient["vitals"] = {}
                            patient["vitals"][k_lower] = v
                        else:
                            if "labs" not in patient: patient["labs"] = {}
                            patient["labs"][k_lower] = v
                
                # Merge abnormalities to symptoms
                if doc.abnormalities:
                    if "symptoms" not in patient: patient["symptoms"] = []
                    for k, v in doc.abnormalities.items():
                        symptom = f"Abnormal {k.replace('_', ' ')}: {v}"
                        if symptom not in patient["symptoms"]:
                            patient["symptoms"].append(symptom)
                            
        patient["reports_data"] = reports_data
        
        # Add newly extracted medical history, meds, and allergies from DB
        from app.db.models import Allergy, MedicalHistory, Medication
        med_hist_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == pid_int))
        patient["medical_history"] = [h.disease_name for h in med_hist_res.scalars().all()]
        
        meds_res = await db.execute(select(Medication).where(Medication.patient_id == pid_int))
        patient["medications"] = [m.medicine_name for m in meds_res.scalars().all()]
        
        algs_res = await db.execute(select(Allergy).where(Allergy.patient_id == pid_int))
        patient["allergies"] = [a.allergen for a in algs_res.scalars().all()]
        
    except Exception as e:
        print(f"Error enriching patient with documents: {e}")
        patient["reports_data"] = []
        
    return patient

@router.get("/patients/{patient_id}/xai")
async def get_xai_analysis(patient_id: str, disease: str = "Cardiovascular", db: AsyncSession = Depends(get_db)):
    patient = await get_enriched_patient(patient_id, db)
    shap = compute_shap_analysis(patient, disease)
    evidence = get_evidence_links(patient)
    return {
        "shap_analysis": shap,
        "evidence_links": evidence
    }


@router.get("/patients/{patient_id}/reasoning")
async def get_reasoning_chain(patient_id: str, db: AsyncSession = Depends(get_db)):
    patient = await get_enriched_patient(patient_id, db)
    chain = generate_reasoning_chain(patient)
    return {"reasoning_chain": chain}


@router.get("/patients/{patient_id}/counterfactual")
async def get_counterfactual(patient_id: str, db: AsyncSession = Depends(get_db)):
    patient = await get_enriched_patient(patient_id, db)
    
    # Get primary disease risk for baseline
    fusion = run_ai_fusion(patient)
    predictions = fusion.get("predictions", {})
    if not predictions:
        base_risk = 50.0
    else:
        top = max(predictions.values(), key=lambda x: x["risk_percent"])
        base_risk = top["risk_percent"]
    
    return compute_counterfactual(patient, base_risk)


@router.get("/patients/{patient_id}/report")
async def get_report(patient_id: str, report_type: str = "patient", db: AsyncSession = Depends(get_db)):
    """
    report_type: "patient" | "clinical" | "executive"
    """
    patient = await get_enriched_patient(patient_id, db)
    
    if report_type == "clinical":
        return generate_clinical_report(patient)
    elif report_type == "executive":
        return generate_executive_report(patient)
    else:
        return generate_patient_report(patient)


@router.post("/patients/{patient_id}/chat")
async def chat_with_assistant(patient_id: str, payload: ChatPayload, db: AsyncSession = Depends(get_db)):
    patient = await get_enriched_patient(patient_id, db)
    
    # Enrich context with fusion data
    fusion = run_ai_fusion(patient)
    enriched_patient = {**patient, "ai_predictions": fusion.get("predictions", {})}
    
    response = query_chatbot(payload.message, patient_context=enriched_patient, history=payload.history)
    
    # Parse structured JSON if possible (for module actions)
    try:
        import json
        if isinstance(response, str) and response.strip().startswith("{") and response.strip().endswith("}"):
            parsed = json.loads(response)
            return {"reply": parsed.get("message", response), "action": parsed.get("action", None), "mode": payload.mode}
    except Exception:
        pass
        
    return {"reply": response, "mode": payload.mode}
