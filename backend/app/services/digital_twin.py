"""
Digital Twin Engine
Computes organ health scores and metric projections from real DB data.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import random
from app.db.models import (
    Patient, DigitalTwin, TwinPrediction, HealthMetric,
    MedicalHistory, Medication, Lifestyle
)


async def generate_twin_state(patient_id: int, db: AsyncSession) -> dict:
    """
    Calculates organ health scores combining:
    1. Extracted lab values (from HealthMetric table)
    2. Medical history (from MedicalHistory table)
    3. Lifestyle (from Lifestyle table)
    4. Patient demographics (BMI, age, gender)
    """
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = pat_res.scalars().first()

    mh_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == patient_id))
    conditions = mh_res.scalars().all()

    ls_res = await db.execute(select(Lifestyle).where(Lifestyle.patient_id == patient_id))
    lifestyle = ls_res.scalars().first()

    metrics_res = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == patient_id))
    metrics = metrics_res.scalars().all()

    # Build labs dict from latest metrics
    labs = {}
    for m in metrics:
        if m.value is not None:
            key = m.metric_name.lower().replace(" ", "_")
            # Keep latest value if there are duplicates
            labs[key] = m.value

    # Base scores
    scores = {
        "cardiac": 100,
        "renal": 100,
        "liver": 100,
        "lung": 100,
        "brain": 100,
        "metabolic": 100
    }

    # --- Adjust from LAB VALUES ---
    hba1c = labs.get("hba1c", 0)
    if hba1c > 6.5:
        scores["metabolic"] -= min(30, (hba1c - 5.7) * 8)
        scores["renal"] -= min(15, (hba1c - 6.5) * 5)
    elif hba1c > 5.7:
        scores["metabolic"] -= 10

    ldl = labs.get("ldl", 0) or labs.get("cholesterol_ldl", 0)
    if ldl > 160:
        scores["cardiac"] -= 25
    elif ldl > 130:
        scores["cardiac"] -= 15
    elif ldl > 100:
        scores["cardiac"] -= 5

    hdl = labs.get("hdl", 60)
    if hdl < 40:
        scores["cardiac"] -= 15
    elif hdl > 60:
        scores["cardiac"] += 5  # protective

    total_chol = labs.get("cholesterol", 0)
    if total_chol > 240:
        scores["cardiac"] -= 15
    elif total_chol > 200:
        scores["cardiac"] -= 8

    # Renal markers
    creatinine = labs.get("creatinine", 0)
    if creatinine > 2.0:
        scores["renal"] -= 30
    elif creatinine > 1.5:
        scores["renal"] -= 20
    elif creatinine > 1.2:
        scores["renal"] -= 10

    egfr = labs.get("egfr", 90)
    if egfr < 60:
        scores["renal"] -= 25
    elif egfr < 90:
        scores["renal"] -= 10

    # Liver markers
    alt = labs.get("alt", 0)
    ast = labs.get("ast", 0)
    if alt > 80 or ast > 80:
        scores["liver"] -= 25
    elif alt > 40 or ast > 40:
        scores["liver"] -= 15

    # Haematology
    hgb = labs.get("hemoglobin", 14)
    if hgb < 10:
        scores["cardiac"] -= 15
        scores["brain"] -= 10
    elif hgb < 12:
        scores["cardiac"] -= 8

    wbc = labs.get("white_blood_cells", 7)
    if wbc > 12 or wbc < 3:
        scores["brain"] -= 10  # immune/inflammatory signal

    # --- Adjust from BMI ---
    if patient and patient.bmi:
        if patient.bmi > 35:
            scores["metabolic"] -= 20
            scores["cardiac"] -= 15
            scores["renal"] -= 5
        elif patient.bmi > 30:
            scores["metabolic"] -= 15
            scores["cardiac"] -= 10
        elif patient.bmi > 25:
            scores["metabolic"] -= 5
            scores["cardiac"] -= 3

    # --- Adjust from AGE ---
    age = patient.age if patient and patient.age else 40
    if age > 70:
        for k in scores:
            scores[k] -= 10
    elif age > 60:
        for k in scores:
            scores[k] -= 5
    elif age > 50:
        for k in scores:
            scores[k] -= 3

    # --- Adjust from MEDICAL CONDITIONS ---
    condition_names = [c.disease_name.lower() for c in conditions]
    for name in condition_names:
        if "diabetes" in name:
            scores["metabolic"] -= 20
            scores["renal"] -= 10
            scores["cardiac"] -= 10
        if "hypertension" in name or "blood pressure" in name:
            scores["cardiac"] -= 20
            scores["renal"] -= 8
        if "asthma" in name or "copd" in name:
            scores["lung"] -= 25
        if "kidney" in name or "renal" in name:
            scores["renal"] -= 25
        if "liver" in name or "cirrhosis" in name or "hepatitis" in name:
            scores["liver"] -= 25
        if "dementia" in name or "alzheimer" in name or "stroke" in name:
            scores["brain"] -= 25
        if "cancer" in name:
            for k in scores:
                scores[k] -= 10

    # --- Adjust from LIFESTYLE ---
    smoking = lifestyle.smoking_status if lifestyle else patient.smoking_status if patient else None
    alcohol = lifestyle.alcohol_consumption if lifestyle else patient.alcohol_use if patient else None
    exercise = lifestyle.exercise_frequency if lifestyle else patient.exercise_level if patient else None

    if smoking and "current" in str(smoking).lower():
        scores["lung"] -= 30
        scores["cardiac"] -= 15
    elif smoking and "former" in str(smoking).lower():
        scores["lung"] -= 10
        scores["cardiac"] -= 5

    if alcohol and str(alcohol).lower() in ["frequent", "heavy"]:
        scores["liver"] -= 20
        scores["brain"] -= 10

    if exercise:
        ex_low = str(exercise).lower()
        if "sedentary" in ex_low:
            scores["cardiac"] -= 10
            scores["metabolic"] -= 5
        elif "active" in ex_low or "vigorous" in ex_low:
            scores["cardiac"] += 5
            scores["metabolic"] += 3

    # Normalize
    for k in scores:
        scores[k] = max(10, min(100, scores[k]))

    overall = int(sum(scores.values()) / len(scores))
    bio_age = age
    if overall < 60:
        bio_age = age + 8
        status = "High Risk"
    elif overall < 75:
        bio_age = age + 4
        status = "Moderate Risk"
    elif overall < 90:
        bio_age = age + 1
        status = "Good"
    else:
        bio_age = age - 2
        status = "Optimal"

    bio_age = max(18, bio_age)

    # --- Save to DB ---
    dt_res = await db.execute(select(DigitalTwin).where(DigitalTwin.patient_id == patient_id))
    twin = dt_res.scalars().first()

    if twin:
        twin.cardiac_health = scores["cardiac"]
        twin.renal_health = scores["renal"]
        twin.liver_health = scores["liver"]
        twin.lung_health = scores["lung"]
        twin.brain_health = scores["brain"]
        twin.metabolic_health = scores["metabolic"]
        twin.health_score = overall
        twin.biological_age = bio_age
        twin.overall_status = status
    else:
        twin = DigitalTwin(
            patient_id=patient_id,
            cardiac_health=scores["cardiac"],
            renal_health=scores["renal"],
            liver_health=scores["liver"],
            lung_health=scores["lung"],
            brain_health=scores["brain"],
            metabolic_health=scores["metabolic"],
            health_score=overall,
            biological_age=bio_age,
            overall_status=status
        )
        db.add(twin)

    await db.commit()

    # Generate projections
    await generate_twin_predictions(patient_id, db, labs, scores, age)

    return scores


async def generate_twin_predictions(patient_id: int, db: AsyncSession, labs: dict, scores: dict, age: int):
    """Generates metric projections based on current state and risk trajectory."""
    # Clear old predictions
    old_res = await db.execute(select(TwinPrediction).where(TwinPrediction.patient_id == patient_id))
    for old in old_res.scalars().all():
        await db.delete(old)

    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = pat_res.scalars().first()

    predictions = []

    # Weight projection
    if patient and patient.weight:
        trend = 1.04 if patient.bmi and patient.bmi > 27 else 1.0
        projected_weight = round(patient.weight * trend + random.uniform(-1, 2), 1)
        predictions.append(TwinPrediction(
            patient_id=patient_id,
            metric_name="Weight (kg)",
            current_value=patient.weight,
            projected_value=projected_weight,
            timeframe_months=12,
            confidence_level=0.82
        ))

    # HbA1c projection
    hba1c = labs.get("hba1c")
    if hba1c:
        # If metabolic is low, trend worsens
        trend_delta = 0.3 if scores["metabolic"] < 70 else 0.1
        predicted_hba1c = round(hba1c + trend_delta + random.uniform(-0.1, 0.2), 1)
        predictions.append(TwinPrediction(
            patient_id=patient_id,
            metric_name="HbA1c (%)",
            current_value=hba1c,
            projected_value=predicted_hba1c,
            timeframe_months=6,
            confidence_level=0.78
        ))

    # LDL projection
    ldl = labs.get("ldl") or labs.get("cholesterol_ldl")
    if ldl:
        trend_delta = 5.0 if scores["cardiac"] < 70 else 0.0
        predictions.append(TwinPrediction(
            patient_id=patient_id,
            metric_name="LDL Cholesterol (mg/dL)",
            current_value=ldl,
            projected_value=round(ldl + trend_delta + random.uniform(-5, 5), 1),
            timeframe_months=6,
            confidence_level=0.75
        ))

    # Cardiac health score projection
    cardiac_trend = -3 if scores["cardiac"] < 70 else 2
    predictions.append(TwinPrediction(
        patient_id=patient_id,
        metric_name="Cardiac Health Score",
        current_value=scores["cardiac"],
        projected_value=max(10, min(100, scores["cardiac"] + cardiac_trend)),
        timeframe_months=12,
        confidence_level=0.80
    ))

    db.add_all(predictions)
    await db.commit()
