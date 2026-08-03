from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# =======================
# LIFESTYLE
# =======================
class LifestyleBase(BaseModel):
    smoking_status: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    sleep_hours: Optional[float] = None
    physical_activity_level: Optional[str] = None
    stress_level: Optional[str] = None
    dietary_preference: Optional[str] = None
    water_intake: Optional[float] = None

class LifestyleCreate(LifestyleBase):
    pass

class LifestyleResponse(LifestyleBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# MEDICAL HISTORY
# =======================
class MedicalHistoryBase(BaseModel):
    disease_name: str
    diagnosis_date: Optional[datetime] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    treating_doctor: Optional[str] = None
    notes: Optional[str] = None

class MedicalHistoryCreate(MedicalHistoryBase):
    pass

class MedicalHistoryResponse(MedicalHistoryBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# FAMILY HISTORY
# =======================
class FamilyHistoryBase(BaseModel):
    relation: str
    disease: str
    age_of_onset: Optional[int] = None

class FamilyHistoryCreate(FamilyHistoryBase):
    pass

class FamilyHistoryResponse(FamilyHistoryBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# ALLERGY
# =======================
class AllergyBase(BaseModel):
    allergen: str
    allergy_type: Optional[str] = None
    severity: Optional[str] = None
    reaction: Optional[str] = None

class AllergyCreate(AllergyBase):
    pass

class AllergyResponse(AllergyBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# MEDICATION
# =======================
class MedicationBase(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    prescribing_doctor: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# SURGERY
# =======================
class SurgeryBase(BaseModel):
    surgery_name: str
    hospital: Optional[str] = None
    date: Optional[datetime] = None
    outcome: Optional[str] = None

class SurgeryCreate(SurgeryBase):
    pass

class SurgeryResponse(SurgeryBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# VACCINATION
# =======================
class VaccinationBase(BaseModel):
    vaccine_name: str
    date: Optional[datetime] = None
    booster_status: Optional[str] = None

class VaccinationCreate(VaccinationBase):
    pass

class VaccinationResponse(VaccinationBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# CLINICAL NOTE
# =======================
class ClinicalNoteBase(BaseModel):
    doctor: Optional[str] = None
    note: str

class ClinicalNoteCreate(ClinicalNoteBase):
    pass

class ClinicalNoteResponse(ClinicalNoteBase):
    id: int
    patient_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# =======================
# APPOINTMENT
# =======================
class AppointmentBase(BaseModel):
    date: datetime
    time: str
    doctor: Optional[str] = None
    hospital: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = "SCHEDULED"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

# =======================
# PATIENT
# =======================
class PatientBase(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: Optional[int] = None

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientResponse(PatientBase):
    patient_id: int
    unique_patient_code: str
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientDetailResponse(PatientResponse):
    lifestyle: Optional[LifestyleResponse] = None
    medical_history: List[MedicalHistoryResponse] = []
    family_history: List[FamilyHistoryResponse] = []
    allergies: List[AllergyResponse] = []
    medications: List[MedicationResponse] = []
    surgeries: List[SurgeryResponse] = []
    vaccinations: List[VaccinationResponse] = []
    appointments: List[AppointmentResponse] = []
