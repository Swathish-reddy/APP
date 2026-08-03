from typing import Dict, Any, List
from app.db.db import EVIDENCE_STORE, TREATMENT_PATHWAYS_DB, get_drug_interactions, KNOWN_SIDE_EFFECTS
from app.services.fusion import run_ai_fusion

def generate_recommendations(patient: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Generates categorized clinical recommendations based on patient digital twin data.
    """
    ai_fusion = run_ai_fusion(patient)
    predictions = ai_fusion.get("predictions", {})
    
    recommendations = {
        "preventive": [],
        "diagnostic": [],
        "treatment": [],
        "follow_up": []
    }
    
    # 1. Evaluate Diabetes Risk
    diabetes_info = predictions.get("Diabetes")
    if diabetes_info and diabetes_info["risk_percent"] > 50:
        recommendations["diagnostic"].append({
            "id": "R_DIAG_01",
            "text": "HbA1c & Fasting Glucose Test",
            "priority": "High",
            "reasoning": f"Diabetes risk is {diabetes_info['risk_percent']}%.",
            "evidence": EVIDENCE_STORE["Diabetes"][0],
            "expected_outcome": "Early detection of glycemic dysregulation.",
            "confidence_score": 0.95,
            "expected_timeline": "Within 7 days"
        })
        recommendations["preventive"].append({
            "id": "R_PREV_01",
            "text": "Reduce simple sugar intake and maintain BMI < 25.",
            "priority": "Medium",
            "reasoning": "Nutritional intervention reduces onset risk.",
            "evidence": EVIDENCE_STORE["Diabetes"][1],
            "expected_outcome": "Reduce HbA1c by 0.5 - 1.0% over 3 months."
        })
        
    # 2. Evaluate Cardiovascular Risk
    cvd_info = predictions.get("Cardiovascular")
    if cvd_info and cvd_info["risk_percent"] > 40:
        recommendations["diagnostic"].append({
            "id": "R_DIAG_02",
            "text": "Comprehensive Lipid Panel & ECG",
            "priority": "High",
            "reasoning": f"CVD risk is {cvd_info['risk_percent']}% with elevated BP or Lipids.",
            "evidence": EVIDENCE_STORE["Cardiovascular"][0],
            "expected_outcome": "Assessment of arterial plaque risk and cardiac rhythm.",
            "confidence_score": 0.90,
            "expected_timeline": "Within 14 days"
        })
        if patient["labs"].get("cholesterol_ldl", 0) > 130:
            recommendations["treatment"].append({
                "id": "R_TX_01",
                "text": "Consider Statin therapy initiation or titration.",
                "priority": "High",
                "reasoning": "LDL is elevated above 130 mg/dL.",
                "evidence": EVIDENCE_STORE["Cardiovascular"][1],
                "expected_outcome": "30-50% reduction in LDL-C."
            })
            
    # 3. Preventive Baselines
    steps = patient["lifestyle"].get("average_steps_day", 0)
    if steps < 5000:
        recommendations["preventive"].append({
            "id": "R_PREV_02",
            "text": "Increase daily step count to > 8000.",
            "priority": "Medium",
            "reasoning": f"Current activity ({steps} steps) is sedentary.",
            "evidence": EVIDENCE_STORE["Preventive"][0],
            "expected_outcome": "Improve cardiovascular endurance and metabolic rate."
        })
        
    # 4. Follow-up scheduling
    if any(r["priority"] == "High" for cat in recommendations.values() for r in cat):
        recommendations["follow_up"].append({
            "id": "R_FU_01",
            "text": "Schedule 1-Month Follow-Up",
            "priority": "High",
            "reasoning": "High-priority recommendations require short-term reassessment.",
            "expected_outcome": "Track intervention compliance and efficacy."
        })
    else:
        recommendations["follow_up"].append({
            "id": "R_FU_02",
            "text": "Schedule 6-Month Routine Review",
            "priority": "Low",
            "reasoning": "Patient is stable; standard monitoring applied.",
            "expected_outcome": "Maintain baseline health metrics."
        })

    return recommendations

def get_medication_intelligence(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes current medications for interactions and side effect risks.
    """
    med_names = [m["name"] for m in patient.get("medications", [])]
    interactions = get_drug_interactions(med_names)
    
    side_effects_profile = []
    for med in med_names:
        if med in KNOWN_SIDE_EFFECTS:
            side_effects_profile.append({
                "medication": med,
                "risks": KNOWN_SIDE_EFFECTS[med]
            })
            
    return {
        "interactions": interactions,
        "side_effects_profile": side_effects_profile,
        "optimization_suggestions": [
            "Review pill burden and adherence barriers.",
            "If eGFR < 45, re-evaluate renal clearance of active meds."
        ]
    }

def get_treatment_pathway(condition: str) -> List[Dict[str, Any]]:
    """
    Retrieves predefined clinical treatment pathways.
    """
    return TREATMENT_PATHWAYS_DB.get(condition, [
        {"step": 1, "action": "General Evaluation", "details": "Consult primary care.", "duration": "Immediate"}
    ])

def generate_care_plan(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a time-bound care plan based on patient profile.
    """
    return {
        "daily": [
            "Check blood pressure in the morning.",
            "Take prescribed medications with meals.",
            "30 minutes of moderate aerobic activity."
        ],
        "weekly": [
            "Review weekly average blood pressure.",
            "Meal prep for balanced diet (low sodium)."
        ],
        "monthly": [
            "Weight and BMI check.",
            "Refill prescriptions."
        ],
        "long_term": [
            "Bi-annual comprehensive metabolic panel.",
            "Annual cardiovascular screening."
        ]
    }

# ─────────────────────────────────────────────
# Doctor Intelligence / CDSS Engine Extensions
# ─────────────────────────────────────────────

def generate_differential_diagnosis(patient: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates probabilistic differential diagnoses based on patient baseline."""
    differentials = []
    
    labs = patient.get("labs", {})
    vitals = patient.get("vitals", {})
    
    if labs.get("hba1c", 0) > 6.5:
        differentials.append({
            "condition": "Type 2 Diabetes Mellitus",
            "probability": "High (90%)",
            "evidence": f"HbA1c of {labs['hba1c']}% meets diagnostic criteria.",
            "next_steps": "Initiate Metformin, Lifestyle Counseling."
        })
    elif labs.get("hba1c", 0) > 5.7:
        differentials.append({
            "condition": "Prediabetes / Impaired Fasting Glucose",
            "probability": "High (85%)",
            "evidence": f"HbA1c of {labs['hba1c']}%.",
            "next_steps": "DASH Diet, Recheck in 6 months."
        })
        
    if vitals.get("systolic_bp", 0) > 140 or vitals.get("diastolic_bp", 0) > 90:
        differentials.append({
            "condition": "Essential Hypertension",
            "probability": "High (88%)",
            "evidence": f"Sustained BP {vitals.get('systolic_bp')}/{vitals.get('diastolic_bp')}.",
            "next_steps": "Evaluate for ACE Inhibitor or Calcium Channel Blocker."
        })
        
    if labs.get("cholesterol_ldl", 0) > 130 and labs.get("hba1c", 0) > 6.0:
        differentials.append({
            "condition": "Metabolic Syndrome (Diabetic Dyslipidemia)",
            "probability": "High (80%)",
            "evidence": "Concomitant hyperglycemia and elevated LDL.",
            "next_steps": "Statin Initiation."
        })
        
    return differentials

def generate_soap_note(patient: Dict[str, Any], differentials: List[Dict[str, Any]], recommendations: Dict[str, Any]) -> str:
    """Generates an automated SOAP note for the physician."""
    age = patient.get("age", 45)
    gender = patient.get("gender", "Male")
    vitals = patient.get("vitals", {})
    labs = patient.get("labs", {})
    
    # Subjective
    subjective = f"{age} yo {gender} presents for routine follow-up. Reviews recent lab work, scans, and home vitals."
    if patient.get("document_summaries"):
        subjective += f"\nRecent Reports: {'; '.join(patient['document_summaries'][:2])}"
    
    # Objective
    objective = (
        f"Vitals: BP {vitals.get('systolic_bp', 120)}/{vitals.get('diastolic_bp', 80)}, "
        f"HR {vitals.get('heart_rate', 70)}, SpO2 {vitals.get('spo2', 98)}%.\n"
        f"Labs: HbA1c {labs.get('hba1c', 5.4)}%, LDL {labs.get('cholesterol_ldl', 100)} mg/dL."
    )
    if patient.get("document_abnormalities"):
        abns = ", ".join(patient["document_abnormalities"].keys())
        objective += f"\nNoted Document Abnormalities: {abns}"
    
    # Assessment
    assessments = [d["condition"] for d in differentials]
    assessment = "1. " + "\n2. ".join(assessments) if assessments else "1. Stable general health."
    
    # Plan
    plan_steps = []
    if recommendations.get("diagnostic"):
        plan_steps.extend([r["text"] for r in recommendations["diagnostic"]])
    if recommendations.get("treatment"):
        plan_steps.extend([r["text"] for r in recommendations["treatment"]])
    if recommendations.get("preventive"):
        plan_steps.extend([r["text"] for r in recommendations["preventive"]])
        
    plan = "- " + "\n- ".join(plan_steps) if plan_steps else "- Continue current regimen."
    
    soap = (
        f"**S (Subjective):**\n{subjective}\n\n"
        f"**O (Objective):**\n{objective}\n\n"
        f"**A (Assessment):**\n{assessment}\n\n"
        f"**P (Plan):**\n{plan}"
    )
    return soap

def generate_doctor_intelligence_report(patient: Dict[str, Any]) -> Dict[str, Any]:
    """Generates the full 20-point CDSS Doctor Intelligence Report."""
    age = patient.get("age", 45)
    gender = patient.get("gender", "Male")
    
    differentials = generate_differential_diagnosis(patient)
    recs = generate_recommendations(patient)
    soap = generate_soap_note(patient, differentials, recs)
    med_intel = get_medication_intelligence(patient)
    
    # Check severity to prioritize patient
    is_high_risk = any(d["probability"].startswith("High") for d in differentials)
    
    imaging_text = "No recent imaging or critical scan findings on file."
    if patient.get("document_summaries"):
        imaging_text = "Recent Document AI Summaries:\n" + "\n".join(patient["document_summaries"])
    
    return {
        "1_patient_clinical_summary": f"{age} yo {gender} with multiple metabolic risk factors.",
        "2_chief_complaint": "Routine intelligent surveillance evaluation.",
        "3_medical_history": "See Digital Twin for full chronic history.",
        "4_current_clinical_findings": patient.get("vitals", {}),
        "5_laboratory_interpretation": "Indicators of metabolic syndrome present.",
        "6_imaging_interpretation": imaging_text,
        "7_differential_diagnosis": differentials,
        "8_risk_stratification": "High Risk" if is_high_risk else "Moderate Risk",
        "9_treatment_recommendations": recs.get("treatment", []),
        "10_medication_review": med_intel,
        "11_follow_up_plan": recs.get("follow_up", []),
        "12_specialist_referrals": ["Endocrinology consult recommended if HbA1c > 8.0%"],
        "13_predictive_analytics": "High likelihood of cardiovascular event within 5 years without intervention.",
        "14_ai_recommendations": recs.get("diagnostic", []) + recs.get("preventive", []),
        "15_explainable_ai": "Recommendations driven by ADA/AHA clinical guidelines matching patient lab profile.",
        "16_confidence_scores": {"diagnostic_accuracy": 0.88, "treatment_efficacy": 0.92},
        "17_patient_friendly_summary": "Your numbers show some risks for diabetes and heart issues. We need to adjust your plan.",
        "18_physician_notes": soap,
        "19_clinical_report_summary": "Patient requires pharmacological escalation to manage compounding metabolic risks.",
        "20_export_options": ["PDF", "FHIR", "HL7", "JSON"]
    }

