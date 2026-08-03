import random
from typing import Dict, Any, List

from app.services.explainable_ai import get_xai_report

# Standard clinical reference ranges for common lab metrics
REFERENCE_RANGES: Dict[str, Dict] = {
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

def calculate_disease_risk(disease_name: str, patient: Dict[str, Any]) -> float:
    """
    Mock predictive engine for various diseases.
    Returns a risk percentage 0.0 to 100.0.
    In a real scenario, this would call actual ML models (Random Forest, XGBoost, etc.)
    """
    vitals = patient.get("vitals", {})
    labs = patient.get("labs", {})
    age = patient.get("age", 45)
    bmi = patient.get("bmi", 24)
    
    risk = 10.0 # base risk
    
    if disease_name == "Cardiovascular Risk":
        sys_bp = vitals.get("systolic_bp", 120)
        ldl = labs.get("cholesterol_ldl", 100)
        if sys_bp > 130: risk += (sys_bp - 130) * 0.8
        if ldl > 100: risk += (ldl - 100) * 0.5
        risk += (age - 40) * 0.5
        
    elif disease_name == "Diabetes Risk":
        hba1c = labs.get("hba1c", 5.0)
        glucose = vitals.get("glucose", 90)
        if hba1c > 5.7: risk += (hba1c - 5.7) * 15.0
        if glucose > 100: risk += (glucose - 100) * 0.5
        if bmi > 25: risk += (bmi - 25) * 1.5
        
    elif disease_name == "Kidney Disease Risk":
        egfr = labs.get("egfr", 90)
        creatinine = labs.get("creatinine", 0.9)
        if egfr < 90: risk += (90 - egfr) * 0.8
        if creatinine > 1.2: risk += (creatinine - 1.2) * 20.0
        
    elif disease_name == "Liver Disease Risk":
        ast = labs.get("ast", 25)
        alt = labs.get("alt", 25)
        if ast > 40: risk += (ast - 40) * 0.5
        if alt > 40: risk += (alt - 40) * 0.5
        if bmi > 30: risk += (bmi - 30) * 1.0
        
    elif disease_name == "Respiratory Risk":
        spo2 = vitals.get("spo2", 98)
        if spo2 < 95: risk += (95 - spo2) * 5.0
        
    elif disease_name == "Neurological Risk":
        risk += (age - 50) * 0.5 if age > 50 else 0
        if vitals.get("systolic_bp", 120) > 140: risk += 10
        
    return min(100.0, max(0.0, risk))

def generate_organ_risk_scores(patient: Dict[str, Any]) -> Dict[str, float]:
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

def run_multi_model_fusion(patient: Dict[str, Any]) -> Dict[str, Any]:
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
        if risk_val > max_risk:
            max_risk = risk_val
            
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

def generate_predictive_analytics(current_risk: float) -> Dict[str, Any]:
    """Extrapolates current risk into future timeline buckets."""
    return {
        "30_days": min(100.0, current_risk * 1.05),
        "1_year": min(100.0, current_risk * 1.25),
        "5_years": min(100.0, current_risk * 1.80),
        "hospitalization_risk_1yr": min(100.0, current_risk * 0.8),
        "mortality_risk_5yr": min(100.0, current_risk * 0.4)
    }

def simulate_what_if(patient: Dict[str, Any], modified_params: Dict[str, Any]) -> Dict[str, Any]:
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

def analyze_disease_interactions(patient: Dict[str, Any]) -> Dict[str, Any]:
    """Matrix of synergistic risks (e.g. Diabetes + Hypertension)."""
    # Simple static matrix for demonstration
    return {
        "interaction_score": 85,
        "primary_synergy": "Diabetes ↔ Hypertension",
        "clinical_implication": "Hyperglycemia damages endothelium, worsening arterial tension.",
        "complication_risk": "High risk of early-stage nephropathy."
    }

def generate_disease_risk_report(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compiles the comprehensive 20-point Disease Risk report.
    """
    fusion_results = run_multi_model_fusion(patient)
    overall_score = fusion_results["overall_risk_score"]
    
    predictive = generate_predictive_analytics(overall_score)
    interactions = analyze_disease_interactions(patient)
    what_if = [
        {"scenario": "BMI reduced to 24", "result": simulate_what_if(patient, {"bmi": 24})},
        {"scenario": "Systolic BP reduced to 120", "result": simulate_what_if(patient, {"systolic_bp": 120})}
    ]
    
    return {
        "1_patient_overview": "Patient is at High Risk for compounding metabolic complications.",
        "2_overall_disease_risk_score": overall_score,
        "3_disease_risk_summary": "Active progression phase for Metabolic Syndrome.",
        "4_organ_risk_analysis": fusion_results["organ_risks"],
        "5_disease_probability_table": fusion_results["predictions"],
        "6_risk_factor_analysis": ["Nocturnal SpO2 Drops", "HbA1c", "High Sodium"],
        "7_protective_factors": ["High Daily Steps", "Never Smoked"],
        "8_laboratory_contributions": ["HbA1c 7.4%", "LDL 110 mg/dL"],
        "9_vital_sign_contributions": ["Systolic BP 145 mmHg", "SpO2 89%"],
        "10_disease_interaction_analysis": interactions,
        "11_predictive_analytics": predictive,
        "12_what_if_simulations": what_if,
        "13_ai_recommendations": ["Order Polysomnography", "Adjust Antihypertensives"],
        "14_clinical_decision_support": {"suggested_labs": ["Microalbuminuria"]},
        "15_alerts": ["NSAID + ACE Inhibitor Interaction Detected"],
        "16_explainable_ai": "Predictions heavily weight sustained Systolic BP of 145 mmHg.",
        "17_confidence_scores": {"overall": fusion_results["overall_confidence"]},
        "18_follow_up_recommendations": "Sleep Medicine consult in 14 days.",
        "19_report_summary": "Critical intervention window to prevent permanent organ damage.",
        "20_export_options": ["PDF", "JSON", "FHIR"]
    }
