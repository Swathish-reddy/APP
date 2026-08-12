"""
Multi-Agent Medical AI System — CogniVueX
Specialized AI agents that collaborate to produce a unified patient recommendation.
"""
import datetime
from typing import Any

from app.db.db import get_drug_interactions
from app.services.fusion import run_ai_fusion
from app.services.nutrition_engine import get_therapeutic_program
from app.services.twin_engine import estimate_metrics


# ── Base Agent
class BaseAgent:
    name: str = "BaseAgent"
    role: str = "Generic"

    def analyze(self, patient: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


# ── 1. Diagnostic Agent
class DiagnosticAgent(BaseAgent):
    name = "DiagnosticAgent"
    role = "Symptom & Prediction Analyst"

    def analyze(self, patient, context):
        fusion = context.get("fusion", run_ai_fusion(patient))
        predictions = fusion.get("predictions", {})
        top = max(predictions.items(), key=lambda x: x[1]["risk_percent"])
        flags = [d for d, v in predictions.items() if v["risk_percent"] > 45]
        return {
            "agent": self.name,
            "finding": f"Primary concern: {top[0]} at {top[1]['risk_percent']}% risk.",
            "high_risk_diseases": flags,
            "confidence": top[1]["confidence_score"],
            "recommendation": f"Immediate attention to {top[0]} management. Schedule specialist consult."
        }


# ── 2. Digital Twin Agent
class DigitalTwinAgent(BaseAgent):
    name = "DigitalTwinAgent"
    role = "Twin State & Organ Health Analyst"

    def analyze(self, patient, context):
        metrics = estimate_metrics(patient)
        organ_health = metrics.get("organ_health", {})
        weakest = min(organ_health.items(), key=lambda x: x[1]) if organ_health else ("Unknown", 0)
        return {
            "agent": self.name,
            "finding": f"Overall health score: {metrics['overall_health_score']}. Weakest organ: {weakest[0]} ({weakest[1]}/100).",
            "biological_age": metrics.get("biological_age"),
            "life_expectancy": metrics.get("life_expectancy"),
            "readmission_risk": metrics.get("readmission_risk"),
            "organ_health": organ_health,
            "recommendation": f"Prioritize {weakest[0]} organ support. Target biological age reduction via lifestyle interventions."
        }


# ── 3. Nutrition Agent
class NutritionAgent(BaseAgent):
    name = "NutritionAgent"
    role = "Therapeutic Nutrition Specialist"

    def analyze(self, patient, context):
        fusion = context.get("fusion", run_ai_fusion(patient))
        program = get_therapeutic_program(patient, fusion.get("predictions", {}))
        bmi = patient.get("bmi", 24)
        weight_status = "Obese" if bmi >= 30 else ("Overweight" if bmi >= 25 else "Normal")
        return {
            "agent": self.name,
            "finding": f"BMI {round(bmi, 1)} ({weight_status}). Recommended program: {program}.",
            "therapeutic_program": program,
            "bmi": round(bmi, 1),
            "recommendation": f"Enroll in {program} plan. Daily caloric target to be computed by Nutrition Engine."
        }


# ── 4. Medication Agent
class MedicationAgent(BaseAgent):
    name = "MedicationAgent"
    role = "Drug Safety & Adherence Analyst"

    def analyze(self, patient, context):
        meds = [m["name"] for m in patient.get("active_medications", [])]
        interactions = get_drug_interactions(meds)
        critical = [i for i in interactions if i["severity"] == "High"]
        return {
            "agent": self.name,
            "finding": f"{len(meds)} active medications. {len(critical)} high-severity interaction(s) detected.",
            "medications": meds,
            "critical_interactions": critical,
            "recommendation": "Review " + (critical[0]["drug_a"] + "/" + critical[0]["drug_b"] if critical else "No critical interactions") + " with prescribing physician."
        }


# ── 5. Clinical Agent
class ClinicalAgent(BaseAgent):
    name = "ClinicalAgent"
    role = "Clinical Decision Support Specialist"

    def analyze(self, patient, context):
        fusion = context.get("fusion", run_ai_fusion(patient))
        predictions = fusion.get("predictions", {})
        high_risk = [d for d, v in predictions.items() if v["risk_percent"] > 50]
        tests = []
        if "Cardiovascular" in high_risk: tests.extend(["ECG", "Echo", "Coronary Calcium Score"])
        if "Diabetes" in high_risk: tests.extend(["HbA1c repeat", "OGTT", "UACR"])
        if "Kidney" in high_risk: tests.extend(["Renal Panel", "Renal Ultrasound"])
        return {
            "agent": self.name,
            "finding": f"{len(high_risk)} conditions requiring clinical intervention.",
            "high_risk_conditions": high_risk,
            "suggested_tests": list(set(tests)),
            "recommendation": "Prioritize diagnostic workup and schedule multidisciplinary clinical review."
        }


# ── 6. Emergency Agent
class EmergencyAgent(BaseAgent):
    name = "EmergencyAgent"
    role = "Critical Event & Emergency Risk Monitor"

    def analyze(self, patient, context):
        vitals = patient.get("vitals", {})
        hr = vitals.get("heart_rate", 70)
        sys_bp = vitals.get("systolic_bp", 120)
        spo2 = vitals.get("spo2", 98)
        glucose = vitals.get("glucose", 90)

        flags = []
        level = "Stable"
        if hr > 120: flags.append(f"Tachycardia: HR {hr} bpm")
        if sys_bp > 180: flags.append(f"Hypertensive Crisis: {sys_bp} mmHg")
        if spo2 < 90: flags.append(f"Critical Hypoxemia: SpO₂ {spo2}%")
        if glucose < 55: flags.append(f"Severe Hypoglycemia: {glucose} mg/dL")

        if flags: level = "CRITICAL" if len(flags) >= 2 else "HIGH"

        return {
            "agent": self.name,
            "finding": f"Emergency status: {level}. {len(flags)} active flag(s).",
            "emergency_level": level,
            "active_flags": flags,
            "recommendation": "IMMEDIATE 911/Emergency escalation." if level == "CRITICAL" else "Monitor vitals closely. Caregiver notification advised."
        }


# ── 7. Hospital Agent
class HospitalAgent(BaseAgent):
    name = "HospitalAgent"
    role = "Provider & Facility Matching Specialist"

    def analyze(self, patient, context):
        from app.services.care_navigator import (
            calculate_doctor_match,
            calculate_hospital_match,
        )
        top_doctor = calculate_doctor_match(patient)
        top_hospital = calculate_hospital_match(patient)
        doc = top_doctor[0] if top_doctor else {}
        hosp = top_hospital[0] if top_hospital else {}
        return {
            "agent": self.name,
            "finding": f"Best matched provider: {doc.get('name', 'N/A')} (Score: {doc.get('match_score', 0)})",
            "top_doctor": {"name": doc.get("name"), "specialization": doc.get("specialization"), "match_score": doc.get("match_score")},
            "top_hospital": {"name": hosp.get("name"), "match_score": hosp.get("match_score"), "distance": hosp.get("distance_miles")},
            "recommendation": f"Refer to {doc.get('name', 'specialist')} at {hosp.get('name', 'nearest facility')}."
        }


# ── Orchestrator
AGENT_REGISTRY = [
    DiagnosticAgent(),
    DigitalTwinAgent(),
    NutritionAgent(),
    MedicationAgent(),
    ClinicalAgent(),
    EmergencyAgent(),
    HospitalAgent(),
]

def run_agent_consensus(patient: dict) -> dict[str, Any]:
    """
    Coordinates all agents to analyze a patient and build a consensus.
    """
    fusion = run_ai_fusion(patient)
    context = {"fusion": fusion}

    agent_outputs = []
    for agent in AGENT_REGISTRY:
        try:
            result = agent.analyze(patient, context)
            agent_outputs.append(result)
        except Exception as e:
            agent_outputs.append({"agent": agent.name, "error": str(e)})

    # Synthesize consensus: collect all recommendations
    emergency = next((a for a in agent_outputs if a.get("agent") == "EmergencyAgent"), {})
    is_emergency = emergency.get("emergency_level") in ["CRITICAL", "HIGH"]

    consensus_priority = "EMERGENCY ESCALATION" if is_emergency else "Routine Clinical Management"
    unified_recommendation = " | ".join(
        a.get("recommendation", "") for a in agent_outputs if a.get("recommendation")
    )

    return {
        "patient_id": patient.get("id") if isinstance(patient, dict) else getattr(patient, "id", None),
        "agent_outputs": agent_outputs,
        "consensus": {
            "priority": consensus_priority,
            "is_emergency": is_emergency,
            "unified_recommendation": unified_recommendation,
            "agents_consulted": len(agent_outputs),
            "generated_at": datetime.datetime.now().isoformat()
        }
    }
