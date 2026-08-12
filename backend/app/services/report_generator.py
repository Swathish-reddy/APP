"""
Report Generator — GenAI Structured Health Reports for CogniVueX
Generates: Patient Health Report, Clinical Summary Report, Executive Report
"""
import datetime
from typing import Any

from app.services.fusion import run_ai_fusion
from app.services.xai_engine import (
    compute_shap_analysis,
    generate_reasoning_chain,
    get_evidence_links,
)


def _severity_label(risk_percent: float) -> str:
    if risk_percent < 25: return "Low"
    if risk_percent < 50: return "Moderate"
    if risk_percent < 75: return "High"
    return "Critical"


def generate_patient_report(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Full patient-facing health report: health score, risks, recommendations, care plan.
    """
    fusion = run_ai_fusion(patient)
    predictions = fusion.get("predictions", {})
    
    # Overall health score (inverse of weighted average risk)
    avg_risk = sum(p["risk_percent"] for p in predictions.values()) / len(predictions)
    health_score = round(max(0, 100 - avg_risk), 1)
    
    # Top risk
    top_risk = max(predictions.items(), key=lambda x: x[1]["risk_percent"])
    top_disease = top_risk[0]
    top_risk_pct = top_risk[1]["risk_percent"]
    
    # SHAP for top disease
    shap = compute_shap_analysis(patient, top_disease)
    chain = generate_reasoning_chain(patient)
    evidence = get_evidence_links(patient)
    
    # Recommendations summary
    recommendations = []
    for driver in shap["risk_drivers"][:3]:
        recommendations.append(f"Address {driver['feature']}: {driver['explanation']}")
    
    return {
        "report_type": "Patient Health Report",
        "generated_at": datetime.datetime.now().isoformat(),
        "patient_name": patient.get("name", "Unknown"),
        "patient_id": patient.get("id", ""),
        "health_score": health_score,
        "risk_level": _severity_label(avg_risk),
        "disease_predictions": [
            {
                "disease": d,
                "risk_percent": v["risk_percent"],
                "severity": v["severity"],
                "confidence": v["confidence_score"]
            }
            for d, v in sorted(predictions.items(), key=lambda x: x[1]["risk_percent"], reverse=True)
        ],
        "top_risk_disease": top_disease,
        "top_risk_percent": top_risk_pct,
        "key_risk_drivers": shap["risk_drivers"][:4],
        "protective_factors": shap["protective_factors"][:3],
        "reasoning_chain": chain[:6],
        "recent_document_findings": [
            f"[{rep['report_type']}] {rep.get('ai_summary', '')}"
            for rep in patient.get("reports_data", [])
        ],
        "recommendations": recommendations,
        "evidence_links": evidence[:3],
        "vitals_snapshot": patient.get("vitals", {}),
        "labs_snapshot": patient.get("labs", {}),
        "disclaimer": "This report is AI-generated and is intended as clinical decision support only. All findings must be reviewed by a licensed healthcare professional."
    }


def generate_clinical_report(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Clinician-facing summary: concise risk analysis, twin state, suggested tests/referrals.
    """
    fusion = run_ai_fusion(patient)
    predictions = fusion.get("predictions", {})
    chain = generate_reasoning_chain(patient)

    suggested_tests = []
    suggested_referrals = []
    
    for disease, info in predictions.items():
        if info["risk_percent"] > 50:
            if disease == "Cardiovascular":
                suggested_tests.extend(["12-Lead ECG", "Stress Test", "Coronary Calcium Score"])
                suggested_referrals.append("Cardiologist")
            elif disease == "Diabetes":
                suggested_tests.extend(["Fasting Plasma Glucose", "HbA1c (repeat in 3 months)", "Insulin Level"])
                suggested_referrals.append("Endocrinologist")
            elif disease == "Kidney":
                suggested_tests.extend(["Urine ACR", "Renal Ultrasound", "Serum Electrolytes"])
                suggested_referrals.append("Nephrologist")
            elif disease == "Respiratory":
                suggested_tests.extend(["Spirometry (PFT)", "Chest X-Ray", "FeNO Test"])
                suggested_referrals.append("Pulmonologist")

    return {
        "report_type": "Clinical Summary Report",
        "generated_at": datetime.datetime.now().isoformat(),
        "patient_id": patient.get("id", ""),
        "patient_name": patient.get("name", ""),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "active_conditions": patient.get("medical_history", []),
        "current_medications": [m["name"] for m in patient.get("active_medications", [])],
        "risk_profile": {
            d: {"risk": v["risk_percent"], "severity": v["severity"], "confidence": v["confidence_score"]}
            for d, v in predictions.items()
        },
        "reasoning_chain": chain,
        "suggested_diagnostic_tests": list(set(suggested_tests)),
        "suggested_referrals": list(set(suggested_referrals)),
        "monitoring_plan": "Repeat labs in 3 months. Home BP monitoring daily. CGM for glucose trends.",
        "disclaimer": "For licensed clinician use only. AI decision support — not a substitute for clinical judgement."
    }


def generate_executive_report(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Wellness/executive summary: lifestyle analysis, preventive risks, optimization opportunities.
    """
    lifestyle = patient.get("lifestyle", {})
    fusion = run_ai_fusion(patient)
    predictions = fusion.get("predictions", {})

    wellness_score = 0
    observations = []
    
    steps = lifestyle.get("average_steps_day", 5000)
    if steps >= 8000: 
        wellness_score += 20
        observations.append({"area": "Physical Activity", "status": "Excellent", "detail": f"{steps:,} steps/day exceeds WHO target."})
    elif steps >= 5000:
        wellness_score += 10
        observations.append({"area": "Physical Activity", "status": "Moderate", "detail": f"{steps:,} steps/day — target 8,000+"})
    else:
        observations.append({"area": "Physical Activity", "status": "Poor", "detail": f"Only {steps:,} steps/day. Sedentary behaviour risk."})

    sleep = lifestyle.get("sleep_hours", 7.0)
    if sleep >= 7.0:
        wellness_score += 20
        observations.append({"area": "Sleep", "status": "Good", "detail": f"{sleep} hrs — within recommended range."})
    else:
        observations.append({"area": "Sleep", "status": "Insufficient", "detail": f"Only {sleep} hrs. Target 7–9 hrs."})

    stress = lifestyle.get("stress_level_scale_10", 5)
    if stress <= 4:
        wellness_score += 20
        observations.append({"area": "Stress", "status": "Low", "detail": "Low stress maintains healthy HRV and immune function."})
    elif stress <= 6:
        wellness_score += 10
        observations.append({"area": "Stress", "status": "Moderate", "detail": "Moderate stress — mindfulness recommended."})
    else:
        observations.append({"area": "Stress", "status": "High", "detail": f"Stress index {stress}/10 — chronic cortisol risk."})

    smoking = lifestyle.get("smoking_status", "Never Smoked")
    if smoking == "Never Smoked":
        wellness_score += 20
        observations.append({"area": "Tobacco Use", "status": "Non-Smoker", "detail": "Zero tobacco exposure — major protective factor."})
    elif smoking == "Current Smoker":
        observations.append({"area": "Tobacco Use", "status": "Active Smoker", "detail": "Highest single modifiable risk factor — cessation advised urgently."})

    # Preventive risks (high-risk diseases)
    preventive_risks = [
        {"disease": d, "risk": v["risk_percent"], "severity": v["severity"]}
        for d, v in sorted(predictions.items(), key=lambda x: x[1]["risk_percent"], reverse=True)
        if v["risk_percent"] > 30
    ]

    return {
        "report_type": "Executive Health Report",
        "generated_at": datetime.datetime.now().isoformat(),
        "patient_name": patient.get("name", ""),
        "wellness_score": wellness_score,
        "lifestyle_observations": observations,
        "preventive_risk_areas": preventive_risks,
        "optimization_opportunities": [
            "Enroll in structured exercise program (target 150 min/week aerobic)",
            "Initiate mindfulness or CBT-based stress reduction",
            "Schedule annual preventive health screening",
            "Discuss pharmacological prevention with primary care physician"
        ],
        "disclaimer": "This report is generated for wellness and executive health program purposes. Not a medical diagnosis."
    }
