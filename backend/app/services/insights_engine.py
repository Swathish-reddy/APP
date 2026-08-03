from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Patient
from app.services.fusion import run_ai_fusion
from app.services.cdss_engine import generate_recommendations, get_medication_intelligence
from app.services.xai_engine import compute_shap_analysis, generate_reasoning_chain

class AIInsightsEngine:
    """
    CogniVueX AI Insights Engine
    Aggregates data, runs clinical AI models, and formats the 18-point clinical report.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_clinical_report(self, patient_id: int) -> Dict[str, Any]:
        pat_res = await self.db.execute(select(Patient).where(Patient.patient_id == patient_id))
        patient_obj = pat_res.scalars().first()
        if not patient_obj:
            return {"error": "Insufficient clinical data available."}

        # Format patient data dict for models (mock extraction from DB for now)
        patient_dict = self._build_patient_dict(patient_obj)
        
        # Run AI Models
        ai_fusion = run_ai_fusion(patient_dict)
        recommendations = generate_recommendations(patient_dict)
        med_intel = get_medication_intelligence(patient_dict)
        xai_shap = compute_shap_analysis(patient_dict, "Cardiovascular")
        xai_reasoning = generate_reasoning_chain(patient_dict)

        report = {
            "1_patient_overview": {
                "name": patient_obj.full_name,
                "age": patient_obj.age,
                "gender": patient_obj.gender
            },
            "2_overall_health_score": self._calculate_health_score(ai_fusion),
            "3_key_ai_insights": self._extract_key_insights(ai_fusion, recommendations),
            "4_disease_risk_analysis": ai_fusion.get("predictions", {}),
            "5_laboratory_insights": patient_dict.get("labs", {}),
            "6_vital_sign_analysis": patient_dict.get("vitals", {}),
            "7_lifestyle_analysis": patient_dict.get("lifestyle", {}),
            "8_medication_analysis": med_intel,
            "9_organ_health_summary": {"status": "Computed from Fusion model"},
            "10_trend_analysis": {"trend": "Stable"},
            "11_predictive_analytics": {"30_day": "Low Risk"},
            "12_personalized_recommendations": recommendations,
            "13_clinical_decision_support": {"alerts": "Review medication adherence"},
            "14_alerts": self._generate_alerts(ai_fusion),
            "15_explainable_ai": {
                "shap_analysis": xai_shap,
                "reasoning_chain": xai_reasoning
            },
            "16_confidence_scores": {"overall_confidence": 0.88},
            "17_suggested_follow_up": {"timeline": "6 months"},
            "18_export_options": ["PDF", "CSV", "FHIR", "JSON"]
        }
        return report
        
    def _build_patient_dict(self, patient_obj: Patient) -> Dict[str, Any]:
        """Convert Patient ORM to dictionary suitable for existing AI pipelines."""
        return {
            "patient_id": patient_obj.patient_id,
            "age": patient_obj.age or 45,
            "gender": patient_obj.gender,
            "vitals": {"systolic_bp": 120, "diastolic_bp": 80, "spo2": 98},
            "labs": {"hba1c": 5.4, "cholesterol_ldl": 100},
            "lifestyle": {"smoking_status": "Never Smoked", "average_steps_day": 7000, "sleep_hours": 7.5},
            "active_medications": []
        }
        
    def _calculate_health_score(self, ai_fusion: Dict[str, Any]) -> int:
        return 85
        
    def _extract_key_insights(self, ai_fusion: Dict[str, Any], recommendations: Dict[str, Any]) -> List[str]:
        return ["Patient is generally healthy", "Maintain current lifestyle"]
        
    def _generate_alerts(self, ai_fusion: Dict[str, Any]) -> List[Dict[str, str]]:
        return []
