from typing import Any

from app.services.xai_engine import compute_shap_analysis


def get_xai_report(disease_name: str, patient: dict[str, Any]) -> dict[str, Any]:
    """
    Main entry point to get explainable AI insights for a prediction.
    Now uses the advanced xai_engine to generate highly detailed and medically accurate insights.
    """
    # 1. Use the advanced SHAP engine
    advanced_shap = compute_shap_analysis(patient, disease_name)
    
    if advanced_shap.get("status") == "INCOMPLETE_DATA":
        return advanced_shap
    
    # 2. Format feature importance for the frontend Record<string, number>
    shap_vals = {}
    for feature in advanced_shap["all_features"]:
        shap_vals[feature["feature"]] = feature["impact"]
        
    # Sort by absolute impact
    sorted_shap = {k: v for k, v in sorted(shap_vals.items(), key=lambda item: abs(item[1]), reverse=True)}
    
    # 3. Generate a highly detailed clinical interpretation using the advanced explanations
    risk_drivers = advanced_shap.get("risk_drivers", [])
    protective = advanced_shap.get("protective_factors", [])
    
    explanation = f"The AI risk model has analyzed the patient's multi-modal data for {disease_name}. "
    
    if risk_drivers:
        top_risks = risk_drivers[:3]
        explanation += "The primary pathological drivers elevating risk include: "
        explanation += "; ".join([f"{r['feature']} ({r['value']}) - {r['explanation']}" for r in top_risks]) + ". "
        
    if protective:
        top_protective = protective[:2]
        explanation += "Conversely, the patient benefits from protective factors: "
        explanation += "; ".join([f"{p['feature']} ({p['value']}) - {p['explanation']}" for p in top_protective]) + "."
        
    if not risk_drivers and not protective:
        explanation += "The patient exhibits a baseline clinical profile with no significant anomalous biomarkers or lifestyle risk factors detected."
    
    return {
        "status": "SUCCESS",
        "feature_importance": sorted_shap,
        "interpretation": explanation,
        "all_features": advanced_shap.get("all_features", []),
        "required_count": advanced_shap.get("required_count", 0),
        "available_count": advanced_shap.get("available_count", 0),
        "total_documents": advanced_shap.get("total_documents", 0)
    }
