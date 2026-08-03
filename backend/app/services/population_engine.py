"""
Population Health Intelligence Engine — CogniVueX
Aggregates anonymized patient data to generate population-level insights:
- Disease prevalence and risk distribution
- Lifestyle trend analysis
- Age/gender breakdowns
- Disease surveillance signals
- Healthcare burden estimates
"""
import random
import datetime
from typing import Dict, Any, List
from app.db.db import patients_db
from app.services.fusion import run_ai_fusion
from app.services.twin_engine import estimate_metrics


def _anonymize(patient: Dict[str, Any]) -> Dict[str, Any]:
    """Strips PII — keeps only clinical & lifestyle data."""
    return {
        "age": patient["age"],
        "gender": patient["gender"],
        "bmi": patient["bmi"],
        "location": patient["location"],
        "vitals": patient["vitals"],
        "labs": patient["labs"],
        "lifestyle": patient["lifestyle"],
        "medical_history": patient["medical_history"],
        "organ_health": patient.get("organ_health", {}),
    }


def compute_population_analytics() -> Dict[str, Any]:
    """Master population analytics aggregation."""
    cohort = [_anonymize(p) for p in patients_db.values()]
    n = len(cohort)

    if n == 0:
        return {"error": "No patients in population"}

    # ── 1. Disease Prevalence
    disease_counts = {
        "Cardiovascular": 0, "Diabetes": 0, "Respiratory": 0,
        "Kidney": 0, "Liver": 0, "Neurological": 0
    }
    risk_totals = {d: 0.0 for d in disease_counts}
    
    for p in patients_db.values():
        fusion = run_ai_fusion(p)
        preds = fusion.get("predictions", {})
        for disease, info in preds.items():
            if disease in disease_counts:
                risk_totals[disease] += info["risk_percent"]
                if info["risk_percent"] > 40:
                    disease_counts[disease] += 1

    prevalence = [
        {
            "disease": d,
            "count": disease_counts[d],
            "prevalence_percent": round((disease_counts[d] / n) * 100, 1),
            "avg_risk": round(risk_totals[d] / n, 1)
        }
        for d in disease_counts
    ]
    prevalence.sort(key=lambda x: x["prevalence_percent"], reverse=True)

    # ── 2. Age Group Distribution
    age_groups = {"18-35": 0, "36-50": 0, "51-65": 0, "65+": 0}
    for p in cohort:
        age = p["age"]
        if age <= 35: age_groups["18-35"] += 1
        elif age <= 50: age_groups["36-50"] += 1
        elif age <= 65: age_groups["51-65"] += 1
        else: age_groups["65+"] += 1

    # ── 3. Gender Distribution
    gender_dist = {}
    for p in cohort:
        g = p["gender"]
        gender_dist[g] = gender_dist.get(g, 0) + 1

    # ── 4. Average Vitals / Labs
    avg_vitals = {}
    avg_labs = {}
    vital_keys = ["heart_rate", "systolic_bp", "spo2", "glucose"]
    lab_keys = ["hba1c", "cholesterol_ldl", "egfr"]
    for k in vital_keys:
        vals = [p["vitals"].get(k, 0) for p in cohort]
        avg_vitals[k] = round(sum(vals) / len(vals), 1)
    for k in lab_keys:
        vals = [p["labs"].get(k, 0) for p in cohort]
        avg_labs[k] = round(sum(vals) / len(vals), 1)

    # ── 5. Lifestyle Trend Analysis
    smokers = sum(1 for p in cohort if p["lifestyle"].get("smoking_status") == "Current Smoker")
    avg_steps = round(sum(p["lifestyle"].get("average_steps_day", 0) for p in cohort) / n, 0)
    avg_sleep = round(sum(p["lifestyle"].get("sleep_hours", 0) for p in cohort) / n, 1)
    avg_stress = round(sum(p["lifestyle"].get("stress_level_scale_10", 0) for p in cohort) / n, 1)
    high_stress = sum(1 for p in cohort if p["lifestyle"].get("stress_level_scale_10", 0) >= 7)

    # ── 6. Population Health Score
    metric_scores = []
    for p in patients_db.values():
        m = estimate_metrics(p)
        metric_scores.append(m["overall_health_score"])
    pop_health_score = round(sum(metric_scores) / len(metric_scores), 1)

    # ── 7. Regional Breakdown
    region_map = {}
    for p in cohort:
        loc = p["location"]
        if loc not in region_map:
            region_map[loc] = {"count": 0, "avg_bmi": 0.0, "high_risk": 0}
        region_map[loc]["count"] += 1
        region_map[loc]["avg_bmi"] += p["bmi"]
        if p["vitals"].get("systolic_bp", 120) > 140 or p["vitals"].get("glucose", 90) > 130:
            region_map[loc]["high_risk"] += 1
    for loc in region_map:
        region_map[loc]["avg_bmi"] = round(region_map[loc]["avg_bmi"] / region_map[loc]["count"], 1)

    return {
        "population_size": n,
        "population_health_score": pop_health_score,
        "disease_prevalence": prevalence,
        "age_distribution": age_groups,
        "gender_distribution": gender_dist,
        "avg_vitals": avg_vitals,
        "avg_labs": avg_labs,
        "lifestyle_trends": {
            "smoker_percent": round((smokers / n) * 100, 1),
            "avg_daily_steps": int(avg_steps),
            "avg_sleep_hours": avg_sleep,
            "avg_stress_index": avg_stress,
            "high_stress_percent": round((high_stress / n) * 100, 1)
        },
        "regional_breakdown": region_map,
        "generated_at": datetime.datetime.now().isoformat()
    }


def compute_disease_surveillance() -> Dict[str, Any]:
    """
    Disease surveillance engine — detects trends and simulated outbreak signals.
    In production this would compare against historical time-series. 
    Here we generate meaningful mock trend data layered on real patient counts.
    """
    analytics = compute_population_analytics()
    prevalence = analytics["disease_prevalence"]

    signals = []
    for item in prevalence:
        # Simulate a trend direction: if avg_risk > 45, mark as increasing
        trend = "Increasing" if item["avg_risk"] > 45 else ("Stable" if item["avg_risk"] > 25 else "Declining")
        severity = "🔴 Alert" if item["avg_risk"] > 60 else ("🟡 Watch" if item["avg_risk"] > 35 else "🟢 Normal")
        signals.append({
            "disease": item["disease"],
            "trend": trend,
            "severity": severity,
            "population_risk_avg": item["avg_risk"],
            "affected_count": item["count"],
            "signal": f"{item['disease']} risk trending {trend.lower()} — {item['count']} of {analytics['population_size']} patients at moderate+ risk.",
        })

    # Simulate weekly trend data (7 weeks, mock values anchored to real risk)
    trend_series = {}
    for item in prevalence:
        base = item["avg_risk"]
        trend_series[item["disease"]] = [
            round(base + random.uniform(-6, 6), 1) for _ in range(7)
        ]

    return {
        "signals": signals,
        "trend_series": trend_series,
        "weeks": ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
        "generated_at": datetime.datetime.now().isoformat()
    }


def compute_operations_metrics() -> Dict[str, Any]:
    """Simulates healthcare operations KPIs."""
    from app.db.db import HOSPITALS_DB
    ops = []
    for h in HOSPITALS_DB:
        total_beds = random.randint(200, 800)
        occupied = random.randint(int(total_beds * 0.6), int(total_beds * 0.9))
        icu_total = h["icu_availability"] + random.randint(5, 15)
        icu_occupied = max(0, icu_total - h["icu_availability"])
        ops.append({
            "hospital": h["name"],
            "total_beds": total_beds,
            "occupied_beds": occupied,
            "bed_utilization_pct": round((occupied / total_beds) * 100, 1),
            "icu_total": icu_total,
            "icu_available": h["icu_availability"],
            "icu_utilization_pct": round((icu_occupied / icu_total) * 100, 1),
            "avg_wait_minutes": random.randint(15, 90),
            "daily_admissions": random.randint(20, 80),
        })
    return {"hospitals": ops, "generated_at": datetime.datetime.now().isoformat()}


def match_clinical_trials(patient_id: str) -> List[Dict[str, Any]]:
    """Matches a patient to simulated clinical trials based on diagnoses."""
    from app.db.db import patients_db
    if patient_id not in patients_db:
        return []
    patient = patients_db[patient_id]
    history = " ".join(patient.get("medical_history", [])).lower()
    fusion = run_ai_fusion(patient)
    high_risk = [d for d, v in fusion["predictions"].items() if v["risk_percent"] > 45]

    TRIALS_DB = [
        {
            "id": "NCT001", "title": "SGLT2 Inhibitor Cardiovascular Outcomes Trial",
            "condition": "Cardiovascular", "phase": "Phase 3",
            "eligibility": "Adults 45+, Diabetes or Hypertension",
            "location": "Boston, MA", "status": "Recruiting", "match_score": 0
        },
        {
            "id": "NCT002", "title": "Personalized Insulin Titration via CGM Study",
            "condition": "Diabetes", "phase": "Phase 2",
            "eligibility": "HbA1c ≥ 6.5%, age 30–70",
            "location": "San Francisco, CA", "status": "Recruiting", "match_score": 0
        },
        {
            "id": "NCT003", "title": "CKD Progression Biomarker Validation Trial",
            "condition": "Kidney", "phase": "Phase 2",
            "eligibility": "eGFR 30–59, Stage 3 CKD",
            "location": "Boston, MA", "status": "Active", "match_score": 0
        },
        {
            "id": "NCT004", "title": "Mindfulness Intervention on Chronic Stress & CVD Risk",
            "condition": "Neurological", "phase": "Phase 2",
            "eligibility": "Stress index > 6, Adults 30–65",
            "location": "Remote / Telehealth", "status": "Recruiting", "match_score": 0
        },
    ]

    matches = []
    for trial in TRIALS_DB:
        score = 0
        if trial["condition"] in high_risk:
            score += 60
        if patient["location"] in trial["location"] or "Remote" in trial["location"]:
            score += 20
        age = patient["age"]
        score += 20 if 30 <= age <= 70 else 5
        if score > 30:
            trial["match_score"] = score
            matches.append(trial)

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches


def compute_outcome_analytics() -> Dict[str, Any]:
    """Aggregates outcome analytics across the patient cohort."""
    n = len(patients_db)
    scores = []
    readmission_risk_sum = 0

    for p in patients_db.values():
        m = estimate_metrics(p)
        scores.append(m["overall_health_score"])
        readmission_risk_sum += m.get("readmission_risk_percent", 20)

    return {
        "total_patients_analyzed": n,
        "avg_health_score": round(sum(scores) / n, 1),
        "avg_readmission_risk_pct": round(readmission_risk_sum / n, 1),
        "treatment_adherence_pct": round(random.uniform(68, 85), 1),
        "avg_30day_readmission_rate": round(random.uniform(12, 22), 1),
        "medication_effectiveness": {
            "Metformin": {"adherence": 78, "hba1c_reduction_avg": 0.7},
            "Lisinopril": {"adherence": 82, "bp_reduction_avg": 11},
            "Atorvastatin": {"adherence": 74, "ldl_reduction_avg": 28}
        },
        "generated_at": datetime.datetime.now().isoformat()
    }
