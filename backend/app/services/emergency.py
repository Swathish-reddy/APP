from datetime import datetime
from typing import Any

# ─────────────────────────────────────────────────
# Module 13: Emergency Response System
# ─────────────────────────────────────────────────

# Critical vital thresholds (per established clinical guidelines)
EMERGENCY_THRESHOLDS = {
    "heart_rate_high":     {"value": 120, "label": "Tachycardia",         "severity": "Critical"},
    "heart_rate_low":      {"value": 45,  "label": "Bradycardia",          "severity": "Critical"},
    "systolic_bp_high":    {"value": 180, "label": "Hypertensive Crisis",  "severity": "Critical"},
    "systolic_bp_low":     {"value": 85,  "label": "Hypotensive Shock",    "severity": "Critical"},
    "spo2_low":            {"value": 90,  "label": "Severe Hypoxemia",     "severity": "Critical"},
    "spo2_warning":        {"value": 94,  "label": "Mild Hypoxemia",       "severity": "High"},
    "glucose_high":        {"value": 400, "label": "Severe Hyperglycemia", "severity": "Critical"},
    "glucose_low":         {"value": 60,  "label": "Hypoglycemia",         "severity": "Critical"},
    "temperature_high":    {"value": 39.5,"label": "High-Grade Fever",     "severity": "High"},
    "temperature_low":     {"value": 35.0,"label": "Hypothermia",          "severity": "Critical"},
    "respiratory_high":    {"value": 25,  "label": "Tachypnea",            "severity": "High"},
}

def evaluate_emergency(vitals: dict[str, Any], patient_id: str) -> dict[str, Any]:
    """
    Analyses current vital sign readings against critical clinical thresholds.
    Returns triggered emergency alerts, recommended actions, and nearby hospital suggestions.
    """
    alerts = []
    highest_severity = "None"
    severity_rank = {"None": 0, "Moderate": 1, "High": 2, "Critical": 3}

    hr = vitals.get("heart_rate", 75)
    sys_bp = vitals.get("systolic_bp", 120)
    spo2 = vitals.get("spo2", 98)
    glucose = vitals.get("glucose", 90)
    temp = vitals.get("temperature", 36.6)
    rr = vitals.get("respiratory_rate", 16)

    # Heart Rate checks
    if hr >= EMERGENCY_THRESHOLDS["heart_rate_high"]["value"]:
        alerts.append({
            "parameter": "Heart Rate",
            "value": f"{hr} bpm",
            "condition": EMERGENCY_THRESHOLDS["heart_rate_high"]["label"],
            "severity": "Critical",
            "action": "Immediate ECG and cardiology consult required. Administer antiarrhythmic if indicated.",
            "contact": "Emergency Cardiology Team"
        })
        highest_severity = "Critical"
    elif hr <= EMERGENCY_THRESHOLDS["heart_rate_low"]["value"]:
        alerts.append({
            "parameter": "Heart Rate",
            "value": f"{hr} bpm",
            "condition": EMERGENCY_THRESHOLDS["heart_rate_low"]["label"],
            "severity": "Critical",
            "action": "Assess for cardiac block. Prepare atropine. Alert cardiology immediately.",
            "contact": "Emergency Cardiology Team"
        })
        highest_severity = "Critical"

    # Blood Pressure checks
    if sys_bp >= EMERGENCY_THRESHOLDS["systolic_bp_high"]["value"]:
        alerts.append({
            "parameter": "Systolic Blood Pressure",
            "value": f"{sys_bp} mmHg",
            "condition": EMERGENCY_THRESHOLDS["systolic_bp_high"]["label"],
            "severity": "Critical",
            "action": "Administer IV antihypertensive (Labetalol/Nicardipine). Rule out hypertensive encephalopathy.",
            "contact": "Emergency Physician + Neurology"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"
    elif sys_bp <= EMERGENCY_THRESHOLDS["systolic_bp_low"]["value"]:
        alerts.append({
            "parameter": "Systolic Blood Pressure",
            "value": f"{sys_bp} mmHg",
            "condition": EMERGENCY_THRESHOLDS["systolic_bp_low"]["label"],
            "severity": "Critical",
            "action": "IV fluid resuscitation. Assess for septic/cardiogenic shock. Vasopressors may be required.",
            "contact": "ICU Intensivist + Emergency Team"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"

    # SpO2 checks
    if spo2 <= EMERGENCY_THRESHOLDS["spo2_low"]["value"]:
        alerts.append({
            "parameter": "Oxygen Saturation (SpO2)",
            "value": f"{spo2}%",
            "condition": EMERGENCY_THRESHOLDS["spo2_low"]["label"],
            "severity": "Critical",
            "action": "Apply 100% non-rebreather mask O2. Prepare for intubation. STAT ABG and chest X-ray.",
            "contact": "Respiratory Therapist + Pulmonologist"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"
    elif spo2 <= EMERGENCY_THRESHOLDS["spo2_warning"]["value"]:
        alerts.append({
            "parameter": "Oxygen Saturation (SpO2)",
            "value": f"{spo2}%",
            "condition": EMERGENCY_THRESHOLDS["spo2_warning"]["label"],
            "severity": "High",
            "action": "Apply supplemental O2 via nasal cannula at 4L/min. Monitor closely.",
            "contact": "Primary Care Team + Nursing"
        })
        if severity_rank.get(highest_severity, 0) < 2:
            highest_severity = "High"

    # Glucose checks
    if glucose >= EMERGENCY_THRESHOLDS["glucose_high"]["value"]:
        alerts.append({
            "parameter": "Blood Glucose",
            "value": f"{glucose} mg/dL",
            "condition": EMERGENCY_THRESHOLDS["glucose_high"]["label"],
            "severity": "Critical",
            "action": "IV insulin infusion protocol. Check ketones and pH. Rule out DKA/HHS.",
            "contact": "Endocrinology + ICU"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"
    elif glucose <= EMERGENCY_THRESHOLDS["glucose_low"]["value"]:
        alerts.append({
            "parameter": "Blood Glucose",
            "value": f"{glucose} mg/dL",
            "condition": EMERGENCY_THRESHOLDS["glucose_low"]["label"],
            "severity": "Critical",
            "action": "Administer 25g IV dextrose (D50W) stat. Recheck glucose in 15 mins.",
            "contact": "Nursing + Endocrinology"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"

    # Temperature checks
    if temp >= EMERGENCY_THRESHOLDS["temperature_high"]["value"]:
        alerts.append({
            "parameter": "Body Temperature",
            "value": f"{temp}°C",
            "condition": EMERGENCY_THRESHOLDS["temperature_high"]["label"],
            "severity": "High",
            "action": "Blood cultures x2. Start broad-spectrum antibiotics if sepsis suspected. Cooling measures.",
            "contact": "Infectious Disease + Hospitalist"
        })
        if severity_rank.get(highest_severity, 0) < 2:
            highest_severity = "High"
    elif temp <= EMERGENCY_THRESHOLDS["temperature_low"]["value"]:
        alerts.append({
            "parameter": "Body Temperature",
            "value": f"{temp}°C",
            "condition": EMERGENCY_THRESHOLDS["temperature_low"]["label"],
            "severity": "Critical",
            "action": "Active external warming. IV warm fluids. Monitor core temperature and cardiac rhythm.",
            "contact": "Emergency Team + ICU"
        })
        if severity_rank.get(highest_severity, 0) < 3:
            highest_severity = "Critical"

    # Respiratory Rate
    if rr >= EMERGENCY_THRESHOLDS["respiratory_high"]["value"]:
        alerts.append({
            "parameter": "Respiratory Rate",
            "value": f"{rr} breaths/min",
            "condition": EMERGENCY_THRESHOLDS["respiratory_high"]["label"],
            "severity": "High",
            "action": "Assess for pulmonary embolism, pneumonia, or metabolic acidosis. ABG stat.",
            "contact": "Pulmonologist + Emergency Physician"
        })
        if severity_rank.get(highest_severity, 0) < 2:
            highest_severity = "High"

    # Suggested emergency response protocol
    recommended_actions = []
    if highest_severity == "Critical":
        recommended_actions = [
            "Activate Code Blue / Emergency Response Team immediately",
            "Notify primary attending physician and on-call specialist",
            "Prepare crash cart and resuscitation equipment",
            "Alert nearest ICU bed availability",
            "Notify emergency contact / designated caregiver",
            "Document all interventions with timestamps in electronic medical record"
        ]
    elif highest_severity == "High":
        recommended_actions = [
            "Escalate to attending physician within 10 minutes",
            "Increase vital sign monitoring frequency to q15min",
            "Prepare relevant medications and equipment",
            "Notify caregiver / family liaison",
            "Reassess in 30 minutes after intervention"
        ]

    # Nearby hospital suggestions (filtered from HOSPITALS_DB by ICU availability)
    from app.db.db import HOSPITALS_DB
    hospital_suggestions = []
    for h in sorted(HOSPITALS_DB, key=lambda x: x["icu_availability"], reverse=True)[:2]:
        hospital_suggestions.append({
            "name": h["name"],
            "icu_beds": h["icu_availability"],
            "distance_miles": h["distance_miles"],
            "success_rate": h["success_rate"]
        })

    return {
        "patient_id": patient_id,
        "evaluated_at": datetime.now().isoformat(),
        "overall_severity": highest_severity,
        "alerts_count": len(alerts),
        "alerts": alerts,
        "recommended_actions": recommended_actions,
        "hospital_suggestions": hospital_suggestions,
        "emergency_contacts": [
            {"role": "Primary Physician", "action": "Call immediately if Critical"},
            {"role": "Caregiver / Family", "action": "SMS + Push notification triggered"},
            {"role": "Emergency Services", "action": "911 - if no hospital response in 5 min"}
        ]
    }
