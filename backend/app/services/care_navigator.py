import datetime
from typing import Any

from app.db.db import (
    APPOINTMENTS_DB,
    DIAGNOSTIC_CENTERS_DB,
    DOCTORS_DB,
    HOSPITALS_DB,
    PATIENT_JOURNEYS_DB,
    REFERRALS_DB,
)
from app.services.fusion import run_ai_fusion


def calculate_doctor_match(patient: dict[str, Any]) -> list[dict[str, Any]]:
    ai_fusion = run_ai_fusion(patient)
    predictions = ai_fusion.get("predictions", {})
    
    # Identify primary disease risk
    primary_risk = None
    max_risk = 0
    for disease, info in predictions.items():
        if info["risk_percent"] > max_risk:
            max_risk = info["risk_percent"]
            primary_risk = disease
            
    specialization_mapping = {
        "Cardiovascular": "Cardiologist",
        "Diabetes": "Endocrinologist",
        "Respiratory": "Pulmonologist",
        "Kidney": "Nephrologist",
        "Liver": "Gastroenterologist",
        "Neurological": "Neurologist"
    }
    
    target_spec = specialization_mapping.get(primary_risk, "General Physician") if primary_risk else "General Physician"
    
    recommendations = []
    for doc in DOCTORS_DB:
        score = 50.0
        
        # Specialization Match
        if target_spec in doc["specialization"]:
            score += 30.0
            
        # Distance (mock logic)
        score += 10.0 if doc["location"] == patient["location"] else 0.0
        
        # Rating & Reviews
        score += (doc["rating"] - 4.0) * 10
        
        # Telemedicine
        if doc.get("telemedicine_support"):
            score += 5.0
            
        rec = doc.copy()
        rec["match_score"] = round(min(100.0, score), 1)
        rec["xai"] = {
            "why_selected": f"High match for {primary_risk} risk.",
            "matching_criteria": ["Specialization", "Distance", "Rating"],
            "expected_outcome": "Expert management of predicted condition."
        }
        recommendations.append(rec)
        
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations

def calculate_hospital_match(patient: dict[str, Any]) -> list[dict[str, Any]]:
    recommendations = []
    
    # Check if emergency
    vitals = patient.get("vitals", {})
    is_emergency = vitals.get("heart_rate", 70) > 120 or vitals.get("systolic_bp", 120) > 180
    
    for hosp in HOSPITALS_DB:
        score = hosp["ranking_score"]
        
        if is_emergency and "Level 1" in hosp.get("emergency_readiness", ""):
            score += 20.0
            
        score += max(0, (10 - hosp["distance_miles"]) * 2)
        
        rec = hosp.copy()
        rec["match_score"] = round(min(100.0, score), 1)
        rec["xai"] = {
            "why_selected": "High emergency readiness." if is_emergency else "Top overall ranking.",
            "expected_outcome": "Optimal critical care response." if is_emergency else "High quality general care."
        }
        recommendations.append(rec)
        
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations

def get_diagnostic_centers(patient: dict[str, Any]) -> list[dict[str, Any]]:
    # Just sort by rating for now
    centers = [c.copy() for c in DIAGNOSTIC_CENTERS_DB]
    for c in centers:
        c["match_score"] = round(c["rating"] * 20, 1)
    centers.sort(key=lambda x: x["match_score"], reverse=True)
    return centers

def generate_care_pathway(patient_id: str, patient: dict[str, Any]) -> list[dict[str, Any]]:
    ai_fusion = run_ai_fusion(patient)
    ai_fusion.get("predictions", {})
    
    pathway = []
    pathway.append({"step": "Diagnosis", "status": "Completed", "detail": "AI Fusion detected elevated risks.", "date": datetime.datetime.now().strftime("%Y-%m-%d")})
    pathway.append({"step": "Specialist Consult", "status": "Pending", "detail": "Schedule appointment with top matched doctor.", "date": "TBD"})
    pathway.append({"step": "Diagnostics", "status": "Pending", "detail": "Complete suggested lab panels.", "date": "TBD"})
    pathway.append({"step": "Treatment Plan", "status": "Pending", "detail": "Initiate medication or lifestyle changes.", "date": "TBD"})
    
    PATIENT_JOURNEYS_DB[patient_id] = pathway
    return pathway

def book_appointment(patient_id: str, provider_id: str, type: str, date: str) -> dict[str, Any]:
    if patient_id not in APPOINTMENTS_DB:
        APPOINTMENTS_DB[patient_id] = []
        
    appt = {
        "id": f"APT{len(APPOINTMENTS_DB[patient_id])+1}",
        "provider_id": provider_id,
        "type": type,
        "date": date,
        "status": "Confirmed"
    }
    APPOINTMENTS_DB[patient_id].append(appt)
    return appt

def get_appointments(patient_id: str) -> list[dict[str, Any]]:
    return APPOINTMENTS_DB.get(patient_id, [])

def get_referrals(patient_id: str) -> list[dict[str, Any]]:
    return REFERRALS_DB.get(patient_id, [])
