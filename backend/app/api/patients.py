from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
from typing import List

from app.db.session import get_db
from app.db.models import (
    Patient, Lifestyle, MedicalHistory, FamilyHistory,
    Allergy, Medication, Surgery, Vaccination, ClinicalNote, Appointment, User, HealthTimeline
)
from app.api.deps import get_current_user

from app.api.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse, PatientDetailResponse,
    LifestyleCreate, LifestyleResponse, MedicalHistoryCreate, MedicalHistoryResponse,
    AllergyCreate, AllergyResponse, MedicationCreate, MedicationResponse,
    VaccinationCreate, VaccinationResponse, ClinicalNoteCreate, ClinicalNoteResponse,
    AppointmentCreate, AppointmentResponse, FamilyHistoryCreate, FamilyHistoryResponse,
    SurgeryCreate, SurgeryResponse
)

router = APIRouter()

async def get_patient_for_user(
    patient_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Patient:
    result = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this patient record")
    return patient

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = Patient(owner_id=current_user.id, **payload.model_dump(exclude_unset=True))
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    search: str = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Patient).where(Patient.owner_id == current_user.id)
    if search:
        query = query.where(
            or_(
                Patient.full_name.ilike(f"%{search}%"),
                Patient.unique_patient_code.ilike(f"%{search}%"),
                Patient.emergency_contact.ilike(f"%{search}%")
            )
        )
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    patients = result.scalars().all()
    
    if not patients and not search:
        # Auto-create a default patient if none exists
        default_patient = Patient(
            owner_id=current_user.id,
            full_name=current_user.full_name,
            age=30,
            gender="Unknown",
            blood_group="O+"
        )
        db.add(default_patient)
        await db.commit()
        await db.refresh(default_patient)
        patients = [default_patient]
        
    return patients

@router.get("/{patient_id}", response_model=PatientDetailResponse)
async def get_patient_profile(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = select(Patient).options(
        selectinload(Patient.lifestyle),
        selectinload(Patient.medical_history),
        selectinload(Patient.family_history),
        selectinload(Patient.allergies),
        selectinload(Patient.medications),
        selectinload(Patient.surgeries),
        selectinload(Patient.vaccinations),
        selectinload(Patient.clinical_notes),
        selectinload(Patient.appointments)
    ).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id)
    
    result = await db.execute(query)
    patient = result.scalars().first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
        
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    payload: PatientUpdate,
    patient: Patient = Depends(get_patient_for_user),
    db: AsyncSession = Depends(get_db)
):
    for var, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, var, value)
        
    await db.commit()
    await db.refresh(patient)
    return patient

@router.get("/{patient_id}/health-score")
async def get_health_score(
    patient: Patient = Depends(get_patient_for_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Patient).options(
            selectinload(Patient.lifestyle),
            selectinload(Patient.medical_history)
        ).where(Patient.patient_id == patient.patient_id)
    )
    full_patient = result.scalars().first()
        
    # Very basic Health Score calculation v1
    score = 100
    
    if full_patient.bmi:
        if full_patient.bmi > 30 or full_patient.bmi < 18.5:
            score -= 15
        elif full_patient.bmi > 25:
            score -= 5
            
    if full_patient.lifestyle:
        if full_patient.lifestyle.smoking_status and full_patient.lifestyle.smoking_status.lower() in ["current", "yes"]:
            score -= 20
        if full_patient.lifestyle.physical_activity_level and full_patient.lifestyle.physical_activity_level.lower() == "low":
            score -= 10
        if full_patient.lifestyle.sleep_hours and full_patient.lifestyle.sleep_hours < 6:
            score -= 5
            
    if full_patient.medical_history:
        active_conditions = [mh for mh in full_patient.medical_history if mh.status and mh.status.lower() == "active"]
        score -= len(active_conditions) * 10
        
    score = max(0, min(100, score))
    
    status_label = "Excellent"
    if score < 40:
        status_label = "Critical"
    elif score < 60:
        status_label = "Poor"
    elif score < 80:
        status_label = "Moderate"
    elif score < 90:
        status_label = "Good"
        
    return {
        "patient_id": patient.patient_id,
        "health_score": score,
        "status": status_label
    }

@router.get("/{patient_id}/timeline")
async def get_patient_timeline(
    patient: Patient = Depends(get_patient_for_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HealthTimeline).where(
            HealthTimeline.patient_id == patient.patient_id
        ).order_by(HealthTimeline.event_date.desc())
    )
    return result.scalars().all()

# =======================
# LIFESTYLE CRUD
# =======================
@router.put("/{patient_id}/lifestyle", response_model=LifestyleResponse)
async def update_lifestyle(
    payload: LifestyleCreate,
    patient: Patient = Depends(get_patient_for_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Lifestyle).where(Lifestyle.patient_id == patient.patient_id))
    lifestyle = result.scalars().first()
    
    if lifestyle:
        for var, value in payload.model_dump(exclude_unset=True).items():
            setattr(lifestyle, var, value)
    else:
        lifestyle = Lifestyle(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
        db.add(lifestyle)
        
    await db.commit()
    await db.refresh(lifestyle)
    return lifestyle

# Add simplified CRUDs for MedicalHistory, Allergies, Medications, etc
@router.post("/{patient_id}/medical-history", response_model=MedicalHistoryResponse)
async def add_medical_history(payload: MedicalHistoryCreate, patient: Patient = Depends(get_patient_for_user), db: AsyncSession = Depends(get_db)):
    record = MedicalHistory(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.post("/{patient_id}/allergies", response_model=AllergyResponse)
async def add_allergy(payload: AllergyCreate, patient: Patient = Depends(get_patient_for_user), db: AsyncSession = Depends(get_db)):
    record = Allergy(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.post("/{patient_id}/medications", response_model=MedicationResponse)
async def add_medication(payload: MedicationCreate, patient: Patient = Depends(get_patient_for_user), db: AsyncSession = Depends(get_db)):
    record = Medication(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.post("/{patient_id}/clinical-notes", response_model=ClinicalNoteResponse)
async def add_clinical_note(payload: ClinicalNoteCreate, patient: Patient = Depends(get_patient_for_user), db: AsyncSession = Depends(get_db)):
    record = ClinicalNote(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.post("/{patient_id}/appointments", response_model=AppointmentResponse)
async def add_appointment(payload: AppointmentCreate, patient: Patient = Depends(get_patient_for_user), db: AsyncSession = Depends(get_db)):
    record = Appointment(patient_id=patient.patient_id, **payload.model_dump(exclude_unset=True))
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
