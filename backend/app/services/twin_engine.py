import copy
from typing import Any


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculates BMI given weight in kg and height in cm."""
    if height_cm <= 0:
        return 0
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m * height_m), 1)

def estimate_metrics(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Computes key Digital Twin metrics:
    - Overall Health Score (0-100)
    - Biological Age (relative to chronological age)
    - Life Expectancy (years remaining)
    - Readmission Risk (low, moderate, high)
    - Organ Health scores (Heart, Kidney, Liver, Lung, Brain)
    """
    age = patient["age"]
    gender = patient["gender"]
    bmi = patient.get("bmi") or calculate_bmi(patient["weight_kg"], patient["height_cm"])
    
    # Extract lifestyle
    lifestyle = patient["lifestyle"]
    steps = lifestyle.get("average_steps_day", 5000)
    sleep = lifestyle.get("sleep_hours", 7.0)
    stress = lifestyle.get("stress_level_scale_10", 5)
    smoking = lifestyle.get("smoking_status", "Never Smoked")
    lifestyle.get("diet_type", "Balanced")
    
    # Extract physiological metrics
    vitals = patient["vitals"]
    systolic_bp = vitals.get("systolic_bp", 120)
    diastolic_bp = vitals.get("diastolic_bp", 80)
    spo2 = vitals.get("spo2", 98)
    glucose = vitals.get("glucose", 90)
    
    labs = patient["labs"]
    hba1c = labs.get("hba1c", 5.4)
    ldl = labs.get("cholesterol_ldl", 100)
    egfr = labs.get("egfr", 90)
    fev1 = labs.get("fev1_percent", 90)
    
    # --- ORGAN HEALTH CALCULATIONS ---
    # Heart Health (influenced by BP, LDL, steps, smoking, stress)
    bp_penalty = max(0, (systolic_bp - 120) * 0.5 + (diastolic_bp - 80) * 0.5)
    ldl_penalty = max(0, (ldl - 100) * 0.15)
    steps_bonus = min(15, (steps - 3000) / 500) if steps > 3000 else -10
    smoke_penalty = 25 if smoking == "Current Smoker" else (5 if smoking == "Former Smoker" else 0)
    stress_penalty = stress * 1.5
    
    heart_score = int(max(10, min(100, 95 - bp_penalty - ldl_penalty + steps_bonus - smoke_penalty - stress_penalty)))
    
    # Kidney Health (influenced by eGFR, BP, HbA1c)
    kidney_score = int(max(10, min(100, egfr * 0.95 + (120 - systolic_bp) * 0.15)))
    if hba1c > 6.5:
        kidney_score -= int((hba1c - 6.5) * 5)
    
    # Liver Health (influenced by alcohol, AST/ALT, BMI)
    liver_score = 90
    if labs.get("alt", 25) > 35 or labs.get("ast", 25) > 35:
        liver_score -= 15
    if bmi > 30:
        liver_score -= 10  # Fatty liver risk
    if lifestyle.get("alcohol_intake") == "Heavy":
        liver_score -= 25
    elif lifestyle.get("alcohol_intake") == "Moderate":
        liver_score -= 8
    liver_score = int(max(10, min(100, liver_score)))
    
    # Lung Health (influenced by smoking, asthma, SpO2, FEV1)
    lung_score = int(max(10, min(100, fev1 * 0.9 + (spo2 - 90) * 1.5)))
    if smoking == "Current Smoker":
        lung_score -= 20
    elif smoking == "Former Smoker":
        lung_score -= 8
        
    # Brain Health (influenced by sleep, stress, BP, age)
    sleep_score = min(100, max(20, (sleep / 8.0) * 100))
    brain_score = int(max(10, min(100, 95 - (stress * 1.8) + (sleep_score - 80) * 0.25 - max(0, (systolic_bp - 130) * 0.2) - (age * 0.1))))
    
    # --- OVERALL HEALTH SCORE ---
    # Weighted average of organ scores and lifestyle factor bonuses
    organs_avg = (heart_score * 0.3 + kidney_score * 0.2 + liver_score * 0.15 + lung_score * 0.15 + brain_score * 0.2)
    overall_health_score = int(max(10, min(100, organs_avg)))
    
    # --- BIOLOGICAL AGE ---
    # Can deviate up to 10 years depending on overall health score
    age_delta = (50 - overall_health_score) * 0.2  # If health is 100, delta is -10 (younger); if health is 0, delta is +10
    biological_age = round(age + age_delta, 1)
    
    # --- LIFE EXPECTANCY ---
    # Base life expectancy based on statistics: ~78 for males, ~82 for females
    base_life = 81 if gender == "Female" else 77
    # Adjust based on health profile
    health_delta = (overall_health_score - 70) * 0.35  # Gain or lose years
    if smoking == "Current Smoker":
        health_delta -= 6
    life_expectancy = round(max(age + 2, base_life + health_delta), 1)
    
    # --- READMISSION RISK ---
    # Calculated based on symptoms, age, active medications, and chronic illness history
    risk_points = 0
    if age > 65:
        risk_points += 15
    if len(patient.get("medical_history", [])) > 2:
        risk_points += 25
    if len(patient.get("symptoms", [])) > 1:
        risk_points += 20
    if systolic_bp > 140 or spo2 < 95 or glucose > 130:
        risk_points += 20
    if overall_health_score < 60:
        risk_points += 20
        
    if risk_points < 30:
        readmission_risk = "Low"
        readmission_risk_percent = max(5, risk_points)
    elif risk_points < 65:
        readmission_risk = "Moderate"
        readmission_risk_percent = risk_points
    else:
        readmission_risk = "High"
        readmission_risk_percent = min(95, risk_points)
        
    return {
        "overall_health_score": overall_health_score,
        "biological_age": biological_age,
        "life_expectancy": life_expectancy,
        "readmission_risk": readmission_risk,
        "readmission_risk_percent": int(readmission_risk_percent),
        "organ_health": {
            "heart": heart_score,
            "kidney": kidney_score,
            "liver": liver_score,
            "lung": lung_score,
            "brain": brain_score
        }
    }

def simulate_what_if(patient: dict[str, Any], scenarios: dict[str, Any]) -> dict[str, Any]:
    """
    Simulates changes to patient's health based on hypothetical adjustments:
    - weight_change_kg (float, e.g. -10.0)
    - steps_day (int, e.g. 8000)
    - smoking_status (str, e.g. "Stopped")
    - diet_improvement (bool)
    - medication_changes (List[Dict[str, str]], e.g. adding / removing medications)
    """
    sim_patient = copy.deepcopy(patient)
    
    # 1. Simulate Weight Change
    weight_diff = scenarios.get("weight_change_kg", 0.0)
    if weight_diff != 0:
        sim_patient["weight_kg"] += weight_diff
        sim_patient["bmi"] = calculate_bmi(sim_patient["weight_kg"], sim_patient["height_cm"])
        # Weight loss drops systolic BP, cholesterol, and blood glucose
        if weight_diff < 0:
            loss_factor = abs(weight_diff)
            sim_patient["vitals"]["systolic_bp"] = max(100, int(sim_patient["vitals"]["systolic_bp"] - loss_factor * 0.8))
            sim_patient["vitals"]["diastolic_bp"] = max(60, int(sim_patient["vitals"]["diastolic_bp"] - loss_factor * 0.4))
            sim_patient["labs"]["cholesterol_ldl"] = max(70, int(sim_patient["labs"]["cholesterol_ldl"] - loss_factor * 2.0))
            sim_patient["labs"]["cholesterol_total"] = max(130, int(sim_patient["labs"]["cholesterol_total"] - loss_factor * 2.5))
            sim_patient["labs"]["hba1c"] = max(4.5, round(sim_patient["labs"]["hba1c"] - loss_factor * 0.08, 2))
            sim_patient["vitals"]["glucose"] = max(75, int(sim_patient["vitals"]["glucose"] - loss_factor * 1.5))
    
    # 2. Simulate Steps Change
    target_steps = scenarios.get("steps_day")
    if target_steps is not None:
        old_steps = sim_patient["lifestyle"]["average_steps_day"]
        sim_patient["lifestyle"]["average_steps_day"] = target_steps
        if target_steps > old_steps:
            increase = target_steps - old_steps
            # Steps boost cardiovascular performance
            sim_patient["vitals"]["heart_rate"] = max(55, int(sim_patient["vitals"]["heart_rate"] - (increase / 2000) * 1.5))
            sim_patient["vitals"]["systolic_bp"] = max(100, int(sim_patient["vitals"]["systolic_bp"] - (increase / 2000) * 1.2))
            sim_patient["labs"]["cholesterol_hdl"] = min(80, int(sim_patient["labs"]["cholesterol_hdl"] + (increase / 2000) * 1.0))
            sim_patient["labs"]["cholesterol_ldl"] = max(70, int(sim_patient["labs"]["cholesterol_ldl"] - (increase / 2000) * 1.5))
            sim_patient["lifestyle"]["stress_level_scale_10"] = max(1, int(sim_patient["lifestyle"]["stress_level_scale_10"] - (increase / 3000)))
            
    # 3. Simulate Smoking Cessation
    stop_smoking = scenarios.get("stop_smoking", False)
    if stop_smoking and sim_patient["lifestyle"]["smoking_status"] == "Current Smoker":
        sim_patient["lifestyle"]["smoking_status"] = "Former Smoker"
        # Immediate cardiovascular and lung volume improvements
        sim_patient["labs"]["fev1_percent"] = min(100, sim_patient["labs"]["fev1_percent"] + 12)
        sim_patient["vitals"]["spo2"] = min(100, sim_patient["vitals"]["spo2"] + 2)
        sim_patient["vitals"]["systolic_bp"] = max(100, int(sim_patient["vitals"]["systolic_bp"] - 8))
        sim_patient["vitals"]["heart_rate"] = max(55, int(sim_patient["vitals"]["heart_rate"] - 5))
        
    # 4. Simulate Diet Change
    diet_change = scenarios.get("diet_type")
    if diet_change:
        sim_patient["lifestyle"]["diet_type"] = diet_change
        if "Mediterranean" in diet_change or "Low Sodium" in diet_change or "DASH" in diet_change:
            # Huge improvements to cholesterol and blood pressure
            sim_patient["labs"]["cholesterol_ldl"] = max(70, int(sim_patient["labs"]["cholesterol_ldl"] * 0.85))
            sim_patient["labs"]["cholesterol_total"] = max(120, int(sim_patient["labs"]["cholesterol_total"] * 0.85))
            sim_patient["vitals"]["systolic_bp"] = max(100, int(sim_patient["vitals"]["systolic_bp"] * 0.92))
            sim_patient["vitals"]["diastolic_bp"] = max(60, int(sim_patient["vitals"]["diastolic_bp"] * 0.92))
            sim_patient["labs"]["hba1c"] = max(4.5, round(sim_patient["labs"]["hba1c"] * 0.92, 2))
            
    # 5. Simulate Medication Changes
    # (e.g. adding new blood pressure med, or stopping one)
    med_changes = scenarios.get("medication_changes")
    if med_changes:
        # e.g., [{"action": "add", "name": "Amlodipine", "dosage": "5mg"}, {"action": "remove", "name": "Metformin"}]
        current_meds = [m["name"] for m in sim_patient["active_medications"]]
        for change in med_changes:
            action = change.get("action")
            name = change.get("name")
            if action == "add" and name not in current_meds:
                sim_patient["active_medications"].append({
                    "name": name,
                    "dosage": change.get("dosage", "standard"),
                    "schedule": "As directed"
                })
                # Simulate clinical response to drug class
                if name == "Amlodipine" or name == "Metoprolol": # BP meds
                    sim_patient["vitals"]["systolic_bp"] = max(100, int(sim_patient["vitals"]["systolic_bp"] * 0.88))
                    sim_patient["vitals"]["diastolic_bp"] = max(60, int(sim_patient["vitals"]["diastolic_bp"] * 0.88))
                    if name == "Metoprolol":
                        sim_patient["vitals"]["heart_rate"] = max(50, int(sim_patient["vitals"]["heart_rate"] * 0.85))
                elif name == "Jardiance" or name == "Ozempic": # Diabetes meds
                    sim_patient["labs"]["hba1c"] = max(4.5, round(sim_patient["labs"]["hba1c"] * 0.86, 2))
                    sim_patient["vitals"]["glucose"] = max(80, int(sim_patient["vitals"]["glucose"] * 0.85))
                    if name == "Ozempic":
                        # weight loss side-effect
                        sim_patient["weight_kg"] = max(45.0, round(sim_patient["weight_kg"] - 5.0, 1))
            elif action == "remove":
                sim_patient["active_medications"] = [m for m in sim_patient["active_medications"] if m["name"] != name]
                # Revert effect
                if name == "Lisinopril" or name == "Metformin":
                    if name == "Lisinopril":
                        sim_patient["vitals"]["systolic_bp"] = int(sim_patient["vitals"]["systolic_bp"] * 1.12)
                    if name == "Metformin":
                        sim_patient["labs"]["hba1c"] = round(sim_patient["labs"]["hba1c"] * 1.15, 2)
                        
    # Re-evaluate all core metrics for the simulated state
    simulated_metrics = estimate_metrics(sim_patient)
    
    # Format changes
    original_metrics = estimate_metrics(patient)
    
    return {
        "original": {
            "health_score": original_metrics["overall_health_score"],
            "biological_age": original_metrics["biological_age"],
            "life_expectancy": original_metrics["life_expectancy"],
            "readmission_risk": original_metrics["readmission_risk"],
            "organ_health": original_metrics["organ_health"],
            "systolic_bp": patient["vitals"]["systolic_bp"],
            "glucose": patient["vitals"]["glucose"],
            "hba1c": patient["labs"]["hba1c"],
            "cholesterol_ldl": patient["labs"]["cholesterol_ldl"]
        },
        "simulated": {
            "health_score": simulated_metrics["overall_health_score"],
            "biological_age": simulated_metrics["biological_age"],
            "life_expectancy": simulated_metrics["life_expectancy"],
            "readmission_risk": simulated_metrics["readmission_risk"],
            "organ_health": simulated_metrics["organ_health"],
            "systolic_bp": sim_patient["vitals"]["systolic_bp"],
            "glucose": sim_patient["vitals"]["glucose"],
            "hba1c": sim_patient["labs"]["hba1c"],
            "cholesterol_ldl": sim_patient["labs"]["cholesterol_ldl"]
        }
    }
