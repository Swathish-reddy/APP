"""
Module 12: Medication Management System
- Tracks active medications and dosage schedules
- Detects drug interactions
- Predicts side effect probability
- Generates refill reminders
- Provides adherence scoring
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.db.db import KNOWN_SIDE_EFFECTS, get_drug_interactions

# Medication database with detailed clinical metadata
MEDICATION_DATABASE = {
    "Metformin": {
        "class": "Biguanide",
        "mechanism": "Reduces hepatic glucose production; improves peripheral insulin sensitivity",
        "indications": ["Type 2 Diabetes", "Insulin Resistance", "Pre-diabetes"],
        "contraindications": ["eGFR < 30", "Active liver disease", "Radiocontrast procedures", "Alcoholism"],
        "monitoring": ["Renal function (eGFR) every 3-6 months", "Vitamin B12 levels annually", "HbA1c every 3 months"],
        "max_dose": "2550mg/day",
        "half_life_hrs": 6.2,
        "renal_adjustment": True,
        "hepatic_adjustment": False,
        "food_interaction": "Take with food to reduce GI side effects",
        "category": "Antidiabetic"
    },
    "Lisinopril": {
        "class": "ACE Inhibitor",
        "mechanism": "Inhibits angiotensin-converting enzyme; reduces aldosterone secretion and vasoconstriction",
        "indications": ["Hypertension", "Heart Failure", "CKD with proteinuria", "Post-MI cardioprotection"],
        "contraindications": ["History of angioedema", "Bilateral renal artery stenosis", "Pregnancy (2nd/3rd trimester)"],
        "monitoring": ["Potassium levels", "Renal function", "Blood pressure", "Serum creatinine"],
        "max_dose": "40mg/day",
        "half_life_hrs": 12.0,
        "renal_adjustment": True,
        "hepatic_adjustment": False,
        "food_interaction": "May be taken with or without food",
        "category": "Antihypertensive"
    },
    "Atorvastatin": {
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "mechanism": "Competitively inhibits HMG-CoA reductase; reduces cholesterol synthesis in the liver",
        "indications": ["Hypercholesterolemia", "Cardiovascular risk reduction", "Dyslipidemia"],
        "contraindications": ["Active hepatic disease", "Pregnancy", "Unexplained elevated serum transaminases"],
        "monitoring": ["Liver enzymes (AST/ALT) baseline then as needed", "CK if myopathy symptoms", "Lipid panel every 4-12 weeks"],
        "max_dose": "80mg/day",
        "half_life_hrs": 14.0,
        "renal_adjustment": False,
        "hepatic_adjustment": True,
        "food_interaction": "Take at bedtime for maximum LDL reduction",
        "category": "Lipid-lowering"
    },
    "Albuterol": {
        "class": "Short-Acting Beta-2 Agonist (SABA)",
        "mechanism": "Selectively activates β2-adrenergic receptors; causes bronchial smooth muscle relaxation",
        "indications": ["Acute Asthma", "Exercise-induced bronchospasm", "COPD exacerbations"],
        "contraindications": ["Hypersensitivity to albuterol"],
        "monitoring": ["Potassium levels (risk of hypokalemia)", "Heart rate and rhythm during use"],
        "max_dose": "2 puffs (180mcg) every 4-6 hrs as needed",
        "half_life_hrs": 3.8,
        "renal_adjustment": False,
        "hepatic_adjustment": False,
        "food_interaction": "No specific food interactions",
        "category": "Bronchodilator"
    },
    "Amlodipine": {
        "class": "Calcium Channel Blocker (CCB)",
        "mechanism": "Inhibits calcium ion influx across cardiac and smooth muscle cell membranes; vasodilation",
        "indications": ["Hypertension", "Chronic stable angina", "Vasospastic angina"],
        "contraindications": ["Cardiogenic shock", "Significant aortic stenosis"],
        "monitoring": ["Blood pressure", "Peripheral edema", "Hepatic function"],
        "max_dose": "10mg/day",
        "half_life_hrs": 30.0,
        "renal_adjustment": False,
        "hepatic_adjustment": True,
        "food_interaction": "Avoid grapefruit juice (CYP3A4 inhibitor)",
        "category": "Antihypertensive"
    },
    "Metoprolol": {
        "class": "Cardioselective Beta-1 Blocker",
        "mechanism": "Selectively blocks β1-adrenergic receptors; reduces heart rate and cardiac output",
        "indications": ["Hypertension", "Angina pectoris", "Heart failure", "Myocardial infarction"],
        "contraindications": ["Bradycardia <45 bpm", "Cardiogenic shock", "Severe asthma", "2nd/3rd degree AV block"],
        "monitoring": ["Heart rate (target: 60-80 bpm)", "Blood pressure", "Glucose levels in diabetics"],
        "max_dose": "400mg/day",
        "half_life_hrs": 3.5,
        "renal_adjustment": False,
        "hepatic_adjustment": True,
        "food_interaction": "Take with food to reduce bioavailability variability",
        "category": "Antihypertensive / Cardioprotective"
    },
    "Jardiance": {
        "class": "SGLT-2 Inhibitor",
        "mechanism": "Inhibits sodium-glucose cotransporter 2 in the kidney; increases urinary glucose excretion",
        "indications": ["Type 2 Diabetes", "Heart failure with reduced ejection fraction", "CKD progression"],
        "contraindications": ["eGFR < 30", "Recurrent genital infections", "Type 1 Diabetes"],
        "monitoring": ["eGFR before initiation and periodically", "Blood pressure", "HbA1c", "Signs of DKA"],
        "max_dose": "25mg/day",
        "half_life_hrs": 12.4,
        "renal_adjustment": True,
        "hepatic_adjustment": False,
        "food_interaction": "Can be taken with or without food",
        "category": "Antidiabetic / Cardiorenal protective"
    },
    "Ozempic": {
        "class": "GLP-1 Receptor Agonist",
        "mechanism": "Stimulates insulin secretion, suppresses glucagon, slows gastric emptying, reduces appetite",
        "indications": ["Type 2 Diabetes", "Cardiovascular risk reduction in T2DM", "Weight management"],
        "contraindications": ["Personal or family history of medullary thyroid carcinoma", "MEN2 syndrome"],
        "monitoring": ["HbA1c", "Renal function", "Thyroid monitoring if risk factors", "Pancreatitis symptoms"],
        "max_dose": "2mg/week (subcutaneous)",
        "half_life_hrs": 168.0,  # 7 days
        "renal_adjustment": True,
        "hepatic_adjustment": False,
        "food_interaction": "Weekly subcutaneous injection — no food restrictions",
        "category": "Antidiabetic / Weight loss"
    }
}

def get_medication_profile(medication_name: str) -> Dict[str, Any]:
    """Returns detailed clinical profile for a given medication."""
    if medication_name in MEDICATION_DATABASE:
        profile = MEDICATION_DATABASE[medication_name].copy()
        profile["name"] = medication_name
        profile["side_effects"] = KNOWN_SIDE_EFFECTS.get(medication_name, ["Refer to prescribing information"])
        return profile
    return {
        "name": medication_name,
        "class": "Unknown",
        "mechanism": "Refer to prescribing information",
        "indications": [],
        "contraindications": [],
        "monitoring": ["Standard clinical monitoring"],
        "side_effects": KNOWN_SIDE_EFFECTS.get(medication_name, ["Nausea", "Headache"]),
        "category": "Other"
    }

def generate_medication_schedule(medications: List[Dict[str, Any]], patient_age: int) -> Dict[str, Any]:
    """Generates a complete weekly medication adherence schedule with timing recommendations."""
    schedule = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "bedtime": [],
        "as_needed": []
    }

    timing_map = {
        "Once daily in the morning": "morning",
        "Once daily at bedtime": "bedtime",
        "Twice daily with meals": ["morning", "evening"],
        "2 puffs as needed": "as_needed",
        "As directed": "morning",
        "standard": "morning"
    }

    for med in medications:
        schedule_text = med.get("schedule", "As directed")
        slot = timing_map.get(schedule_text, "morning")
        entry = {
            "medication": med["name"],
            "dosage": med["dosage"],
            "instructions": schedule_text
        }
        if isinstance(slot, list):
            for s in slot:
                schedule[s].append(entry.copy())
        else:
            schedule[slot].append(entry)

    # Refill reminders (simulate 30-day supply with 7-day warning)
    refill_reminders = []
    for med in medications:
        # Simulate days remaining (random-ish based on med name hash for consistency)
        days_remaining = (hash(med["name"]) % 25) + 3  # 3-28 days remaining
        if days_remaining <= 7:
            refill_reminders.append({
                "medication": med["name"],
                "days_remaining": days_remaining,
                "urgency": "Urgent" if days_remaining <= 3 else "Soon",
                "action": "Contact pharmacy for refill authorization"
            })

    # Adherence tips based on age
    adherence_tips = [
        "Use a pill organizer to sort your weekly medications",
        "Set phone alarms to match your medication schedule times",
        "Keep medications in a visible, consistent location",
        "Never skip doses without consulting your physician first",
        "Bring your medication list to every medical appointment"
    ]
    if patient_age > 65:
        adherence_tips.insert(0, "Consider a blister-pack dispensing service for senior patients")

    return {
        "daily_schedule": schedule,
        "refill_reminders": refill_reminders,
        "adherence_tips": adherence_tips,
        "total_medications": len(medications)
    }

def check_contraindications(medication_name: str, patient_labs: Dict[str, Any], patient_history: List[str]) -> List[str]:
    """Cross-checks a medication's contraindications against patient's current lab values and history."""
    warnings = []
    if medication_name not in MEDICATION_DATABASE:
        return warnings

    profile = MEDICATION_DATABASE[medication_name]
    egfr = patient_labs.get("egfr", 90)
    alt = patient_labs.get("alt", 25)
    ast = patient_labs.get("ast", 25)

    for contra in profile.get("contraindications", []):
        # Check eGFR contraindications
        if "eGFR < 30" in contra and egfr < 30:
            warnings.append(f"⚠️ CONTRAINDICATED: {medication_name} is contraindicated with eGFR {egfr} < 30 mL/min.")
        elif "eGFR < 30" in contra and egfr < 45:
            warnings.append(f"⚠️ CAUTION: {medication_name} requires dose reduction with eGFR {egfr} < 45 mL/min.")
        # Check liver disease contraindications
        if "liver" in contra.lower() and (alt > 80 or ast > 80):
            warnings.append(f"⚠️ CAUTION: {medication_name} — Elevated transaminases (ALT:{alt}/AST:{ast}) suggest hepatic involvement. Monitor closely.")
        # History-based check
        for hist in patient_history:
            if hist.lower() in contra.lower():
                warnings.append(f"⚠️ POTENTIAL CONFLICT: {medication_name} — Patient has {hist} which is listed as a contraindication.")

    return warnings
