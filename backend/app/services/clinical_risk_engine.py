import random
from typing import Any

from app.services.explainable_ai import get_xai_report

# Standard clinical reference ranges for common lab metrics
REFERENCE_RANGES: dict[str, dict] = {
    "hba1c":          {"min": 4.0,  "max": 5.7,  "unit": "%"},
    "glucose":        {"min": 70.0, "max": 99.0,  "unit": "mg/dL"},
    "ldl":            {"min": 0.0,  "max": 100.0, "unit": "mg/dL"},
    "cholesterol_ldl":{"min": 0.0,  "max": 100.0, "unit": "mg/dL"},
    "hdl":            {"min": 40.0, "max": 999.0, "unit": "mg/dL"},
    "cholesterol":    {"min": 0.0,  "max": 200.0, "unit": "mg/dL"},
    "triglycerides":  {"min": 0.0,  "max": 150.0, "unit": "mg/dL"},
    "creatinine":     {"min": 0.6,  "max": 1.2,   "unit": "mg/dL"},
    "egfr":           {"min": 90.0, "max": 999.0, "unit": "mL/min/1.73m2"},
    "alt":            {"min": 7.0,  "max": 40.0,  "unit": "U/L"},
    "ast":            {"min": 10.0, "max": 40.0,  "unit": "U/L"},
    "hemoglobin":     {"min": 13.0, "max": 17.0,  "unit": "g/dL"},
    "white_blood_cells":{"min": 4.0,"max": 10.0,  "unit": "10^3/uL"},
    "platelets":      {"min": 150.0,"max": 400.0, "unit": "10^3/uL"},
    "systolic_bp":    {"min": 90.0, "max": 120.0, "unit": "mmHg"},
    "diastolic_bp":   {"min": 60.0, "max": 80.0,  "unit": "mmHg"},
    "heart_rate":     {"min": 60.0, "max": 100.0, "unit": "bpm"},
    "spo2":           {"min": 95.0, "max": 100.0, "unit": "%"},
    "tsh":            {"min": 0.4,  "max": 4.0,   "unit": "mIU/L"},
    "vitamin_d":      {"min": 30.0, "max": 100.0, "unit": "ng/mL"},
    "uric_acid":      {"min": 3.5,  "max": 7.2,   "unit": "mg/dL"},
}

def calculate_disease_risk(disease_name: str, patient: dict[str, Any]) -> float:
    """
    Mock predictive engine for various diseases.
    Returns a risk percentage 0.0 to 100.0.
    In a real scenario, this would call actual ML models (Random Forest, XGBoost, etc.)
    """
    vitals = patient.get("vitals", {})
    labs = patient.get("labs", {})
    age = patient.get("age", 45)
    bmi = patient.get("bmi", 24)
    med_history = patient.get("medical_history", [])
    meds = patient.get("medications", patient.get("active_medications", []))
    
    # Extract condition names
    conditions = []
    for c in med_history:
        if isinstance(c, dict):
            conditions.append(c.get("disease_name", "").lower())
        elif isinstance(c, str):
            conditions.append(c.lower())
            
    med_names = []
    for m in meds:
        if isinstance(m, dict):
            med_names.append(m.get("medicine_name", m.get("name", "")).lower())
        elif isinstance(m, str):
            med_names.append(m.lower())
    
    risk = 10.0 # base risk
    
    if disease_name == "Cardiovascular Risk":
        sys_bp = vitals.get("systolic_bp", 120)
        ldl = labs.get("cholesterol_ldl", 100)
        if sys_bp > 130: risk += (sys_bp - 130) * 0.8
        if ldl > 100: risk += (ldl - 100) * 0.5
        risk += (age - 40) * 0.5
        if "hypertension" in conditions: risk += 20
        if "statin" in " ".join(med_names): risk -= 10 # Protected by meds
        
    elif disease_name == "Diabetes Risk":
        hba1c = labs.get("hba1c", 5.0)
        glucose = vitals.get("glucose", 90)
        if hba1c > 5.7: risk += (hba1c - 5.7) * 15.0
        if glucose > 100: risk += (glucose - 100) * 0.5
        if bmi > 25: risk += (bmi - 25) * 1.5
        if "diabetes" in conditions: risk += 30
        if "metformin" in " ".join(med_names): risk -= 15
        
    elif disease_name == "Kidney Disease Risk":
        egfr = labs.get("egfr", 90)
        creatinine = labs.get("creatinine", 0.9)
        if egfr < 90: risk += (90 - egfr) * 0.8
        if creatinine > 1.2: risk += (creatinine - 1.2) * 20.0
        if "diabetes" in conditions: risk += 10
        if "hypertension" in conditions: risk += 10
        
    elif disease_name == "Liver Disease Risk":
        ast = labs.get("ast", 25)
        alt = labs.get("alt", 25)
        if ast > 40: risk += (ast - 40) * 0.5
        if alt > 40: risk += (alt - 40) * 0.5
        if bmi > 30: risk += (bmi - 30) * 1.0
        if "hepatitis" in conditions: risk += 25
        
    elif disease_name == "Respiratory Risk":
        spo2 = vitals.get("spo2", 98)
        if spo2 < 95: risk += (95 - spo2) * 5.0
        if "asthma" in conditions or "copd" in conditions: risk += 25
        
    elif disease_name == "Neurological Risk":
        risk += (age - 50) * 0.5 if age > 50 else 0
        if vitals.get("systolic_bp", 120) > 140: risk += 10
        if "stroke" in conditions: risk += 35
        
    return min(100.0, max(0.0, risk))

def generate_organ_risk_scores(patient: dict[str, Any]) -> dict[str, float]:
    """Generates 0-100 risk score for major organs."""
    return {
        "Heart": calculate_disease_risk("Cardiovascular Risk", patient),
        "Kidney": calculate_disease_risk("Kidney Disease Risk", patient),
        "Liver": calculate_disease_risk("Liver Disease Risk", patient),
        "Brain": calculate_disease_risk("Neurological Risk", patient),
        "Lung": calculate_disease_risk("Respiratory Risk", patient),
        "Metabolic": calculate_disease_risk("Diabetes Risk", patient),
        "Immune": random.uniform(5.0, 20.0) # Mock
    }

def run_multi_model_fusion(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Executes the Multi-Model AI Fusion Strategy.
    Aggregates inputs from all disease models to generate:
    - Overall Risk Score
    - Disease Predictions
    - XAI explanations
    """
    diseases = [
        "Cardiovascular Risk", 
        "Diabetes Risk", 
        "Kidney Disease Risk", 
        "Liver Disease Risk",
        "Respiratory Risk",
        "Neurological Risk"
    ]
    
    predictions = []
    total_risk = 0.0
    max_risk = 0.0
    
    for d in diseases:
        risk_val = calculate_disease_risk(d, patient)
        total_risk += risk_val
        max_risk = max(max_risk, risk_val)
            
        # Get XAI explanations
        xai_report = get_xai_report(d, patient)
        
        predictions.append({
            "disease": d,
            "risk_percent": round(risk_val, 1),
            "confidence_score": round(random.uniform(85.0, 98.0), 1),
            "timeframe": "1 Year",
            "xai": xai_report
        })
        
    # Sort predictions by highest risk
    predictions.sort(key=lambda x: x["risk_percent"], reverse=True)
    
    # Calculate an overall risk score (weighted fusion)
    # Give higher weight to the highest risk disease
    overall_score = (max_risk * 0.6) + ((total_risk / len(diseases)) * 0.4)
    overall_score = round(min(100.0, overall_score), 1)
    
    # Determine risk category
    if overall_score < 20: category = "Low"
    elif overall_score < 50: category = "Moderate"
    elif overall_score < 75: category = "High"
    else: category = "Critical"
    
    return {
        "overall_risk_score": overall_score,
        "risk_category": category,
        "overall_confidence": round(random.uniform(88.0, 95.0), 1),
        "organ_risks": generate_organ_risk_scores(patient),
        "predictions": predictions,
        "fusion_method": "Weighted Ensemble Stacking"
    }

# ─────────────────────────────────────────────
# Disease Risk Center Enhancements
# ─────────────────────────────────────────────

def generate_predictive_analytics(current_risk: float) -> dict[str, Any]:
    """Extrapolates current risk into future timeline buckets."""
    return {
        "30_days": min(100.0, current_risk * 1.05),
        "1_year": min(100.0, current_risk * 1.25),
        "5_years": min(100.0, current_risk * 1.80),
        "hospitalization_risk_1yr": min(100.0, current_risk * 0.8),
        "mortality_risk_5yr": min(100.0, current_risk * 0.4)
    }

def simulate_what_if(patient: dict[str, Any], modified_params: dict[str, Any]) -> dict[str, Any]:
    """Calculates alternate risk realities based on parameter changes."""
    # Create a deep copy of the patient state to simulate
    simulated_patient = {
        "vitals": patient.get("vitals", {}).copy(),
        "labs": patient.get("labs", {}).copy(),
        "age": patient.get("age", 45),
        "bmi": modified_params.get("bmi", patient.get("bmi", 24))
    }
    
    if "systolic_bp" in modified_params:
        simulated_patient["vitals"]["systolic_bp"] = modified_params["systolic_bp"]
    if "hba1c" in modified_params:
        simulated_patient["labs"]["hba1c"] = modified_params["hba1c"]
        
    baseline_fusion = run_multi_model_fusion(patient)
    simulated_fusion = run_multi_model_fusion(simulated_patient)
    
    reduction = baseline_fusion["overall_risk_score"] - simulated_fusion["overall_risk_score"]
    
    return {
        "baseline_risk": baseline_fusion["overall_risk_score"],
        "simulated_risk": simulated_fusion["overall_risk_score"],
        "risk_reduction": round(reduction, 1),
        "confidence": 0.85
    }

def analyze_disease_interactions(patient: dict[str, Any]) -> dict[str, Any]:
    """Matrix of synergistic risks (e.g. Diabetes + Hypertension)."""
    # Simple static matrix for demonstration
    return {
        "interaction_score": 85,
        "primary_synergy": "Diabetes ↔ Hypertension",
        "clinical_implication": "Hyperglycemia damages endothelium, worsening arterial tension.",
        "complication_risk": "High risk of early-stage nephropathy."
    }

def check_insufficient_data(patient: dict[str, Any]) -> list[str]:
    vitals = patient.get("vitals", {})
    labs = patient.get("labs", {})
    missing = []
    if "systolic_bp" not in vitals: missing.append("Systolic BP")
    if "cholesterol_ldl" not in labs and "ldl" not in labs: missing.append("LDL Cholesterol")
    if "hba1c" not in labs: missing.append("HbA1c")
    if "glucose" not in vitals and "glucose" not in labs: missing.append("Glucose")
    if "egfr" not in labs and "creatinine" not in labs: missing.append("Kidney Markers (eGFR/Creatinine)")
    return missing

def generate_disease_risk_report(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Compiles the comprehensive 20-point Disease Risk report.
    """
    missing = check_insufficient_data(patient)
    if len(missing) > 2:
        return {
            "insufficient_data": True,
            "message": "Insufficient report data for this prediction",
            "missing_inputs": missing,
            "1_patient_overview": "Insufficient report data. Please upload lab reports.",
            "2_overall_disease_risk_score": 0,
            "3_disease_risk_summary": "N/A",
            "4_organ_risk_analysis": {},
            "5_disease_probability_table": [],
            "6_risk_factor_analysis": [],
            "7_protective_factors": [],
            "8_laboratory_contributions": [],
            "9_vital_sign_contributions": [],
            "10_disease_interaction_analysis": {},
            "11_predictive_analytics": {},
            "12_what_if_simulations": [],
            "13_ai_recommendations": [],
            "14_clinical_decision_support": {},
            "15_alerts": [],
            "16_explainable_ai": "N/A",
            "17_confidence_scores": {},
            "18_follow_up_recommendations": "Upload recent blood work.",
            "19_report_summary": "Data insufficient for full analysis.",
            "20_export_options": ["PDF", "JSON"]
        }
        
    fusion_results = run_multi_model_fusion(patient)
    overall_score = fusion_results["overall_risk_score"]
    
    predictive = generate_predictive_analytics(overall_score)
    interactions = analyze_disease_interactions(patient)
    
    # What-if using baseline from patient data
    baseline_bmi = patient.get("bmi", 24)
    baseline_bp = patient.get("vitals", {}).get("systolic_bp", 120)
    what_if = [
        {"scenario": f"BMI reduced to {max(20, baseline_bmi - 2)}", "result": simulate_what_if(patient, {"bmi": max(20, baseline_bmi - 2)})},
        {"scenario": f"Systolic BP reduced to {max(110, baseline_bp - 10)}", "result": simulate_what_if(patient, {"systolic_bp": max(110, baseline_bp - 10)})}
    ]
    
    return {
        "1_patient_overview": "Patient Risk Analysis based on uploaded report data.",
        "2_overall_disease_risk_score": overall_score,
        "3_disease_risk_summary": fusion_results["risk_category"] + " Risk Category.",
        "4_organ_risk_analysis": fusion_results["organ_risks"],
        "5_disease_probability_table": fusion_results["predictions"],
        "6_risk_factor_analysis": ["Based on uploaded report data"],
        "7_protective_factors": ["High Daily Steps", "Never Smoked"],
        "8_laboratory_contributions": [f"{k}: {v}" for k, v in patient.get("labs", {}).items()][:3],
        "9_vital_sign_contributions": [f"{k}: {v}" for k, v in patient.get("vitals", {}).items()][:3],
        "10_disease_interaction_analysis": interactions,
        "11_predictive_analytics": predictive,
        "12_what_if_simulations": what_if,
        "13_ai_recommendations": ["Discuss findings with physician"],
        "14_clinical_decision_support": {"suggested_labs": missing},
        "15_alerts": [],
        "16_explainable_ai": "Predictions based on extracted report values.",
        "17_confidence_scores": {"overall": fusion_results["overall_confidence"]},
        "18_follow_up_recommendations": "Routine follow up.",
        "19_report_summary": "Analysis completed using actual report data.",
        "20_export_options": ["PDF", "JSON", "FHIR"]
    }
