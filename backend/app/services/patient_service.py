from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.db.models import (
    Patient, HealthMetric, MedicalHistory, Medication, Allergy, Lifestyle, DigitalTwin
)

async def get_patient_profile_dict(patient_id: str, db: AsyncSession) -> dict:
    # Handle 'P101' format if passed
    pid_int = int(patient_id.replace("P", "")) if isinstance(patient_id, str) and patient_id.startswith("P") else int(patient_id)
    
    # 1. Fetch Patient
    result = await db.execute(select(Patient).where(Patient.patient_id == pid_int))
    patient = result.scalars().first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Build base dict
    pat_dict = {
        "id": f"P{patient.patient_id}",
        "name": patient.full_name,
        "age": patient.age or 45,
        "gender": patient.gender or "Unknown",
        "weight_kg": patient.weight,
        "height_cm": patient.height,
        "bmi": patient.bmi,
        "blood_group": patient.blood_group,
        "location": patient.address or "Unknown",
        "contact": patient.phone or "Unknown",
        "vitals": {},
        "labs": {},
        "lifestyle": {},
        "medical_history": [],
        "active_medications": [],
        "allergies": [],
        "symptoms": [],
        "organ_health": {}
    }
    
    # 2. Fetch Health Metrics (vitals/labs)
    metrics_res = await db.execute(select(HealthMetric).where(HealthMetric.patient_id == pid_int))
    metrics = metrics_res.scalars().all()
    for m in metrics:
        k = m.metric_name.lower()
        if "bp" in k or "heart" in k or "spo2" in k or "temp" in k or "respiratory" in k or "glucose" in k:
            pat_dict["vitals"][k] = m.value
        else:
            pat_dict["labs"][k] = m.value
            
        if m.status and m.status.lower() in ["high", "low", "abnormal", "critical"]:
            pat_dict["symptoms"].append(f"Abnormal {m.metric_name}: {m.value} {m.unit or ''}")
            
    # 3. Fetch Lifestyle
    life_res = await db.execute(select(Lifestyle).where(Lifestyle.patient_id == pid_int))
    lifestyle = life_res.scalars().first()
    if lifestyle:
        pat_dict["lifestyle"] = {
            "average_steps_day": lifestyle.average_steps_day,
            "sleep_hours": lifestyle.sleep_hours,
            "smoking_status": lifestyle.smoking_status,
            "diet_type": lifestyle.diet_type,
            "stress_level": lifestyle.stress_level
        }
        
    # 4. Fetch Medical History, Meds, Allergies
    hist_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == pid_int))
    pat_dict["medical_history"] = [h.disease_name for h in hist_res.scalars().all()]
    
    meds_res = await db.execute(select(Medication).where(Medication.patient_id == pid_int))
    pat_dict["active_medications"] = [{"name": m.medicine_name, "dosage": m.dosage, "schedule": m.frequency} for m in meds_res.scalars().all()]
    
    algs_res = await db.execute(select(Allergy).where(Allergy.patient_id == pid_int))
    pat_dict["allergies"] = [a.allergen for a in algs_res.scalars().all()]
    
    # 5. Fetch Organ Health (Digital Twin)
    twin_res = await db.execute(select(DigitalTwin).where(DigitalTwin.patient_id == pid_int))
    twin = twin_res.scalars().first()
    if twin:
        pat_dict["organ_health"] = {
            "heart": twin.cardiac_health,
            "kidney": twin.renal_health,
            "liver": twin.liver_health,
            "lung": twin.lung_health,
            "brain": twin.brain_health
        }
        
    return pat_dict
