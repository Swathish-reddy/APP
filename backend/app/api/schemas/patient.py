from datetime import datetime

from pydantic import BaseModel


# =======================
# LIFESTYLE
# =======================
class LifestyleBase(BaseModel):
    smoking_status: str | None = None
    alcohol_consumption: str | None = None
    sleep_hours: float | None = None
    physical_activity_level: str | None = None
    stress_level: str | None = None
    dietary_preference: str | None = None
    water_intake: float | None = None

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
    diagnosis_date: datetime | None = None
    severity: str | None = None
    status: str | None = None
    treating_doctor: str | None = None
    notes: str | None = None

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
    age_of_onset: int | None = None

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
    allergy_type: str | None = None
    severity: str | None = None
    reaction: str | None = None

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
    dosage: str | None = None
    frequency: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    prescribing_doctor: str | None = None

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
    hospital: str | None = None
    date: datetime | None = None
    outcome: str | None = None

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
    date: datetime | None = None
    booster_status: str | None = None

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
    doctor: str | None = None
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
    doctor: str | None = None
    hospital: str | None = None
    purpose: str | None = None
    status: str | None = "SCHEDULED"

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
    age: int | None = None
    gender: str | None = None
    blood_group: str | None = None
    height: float | None = None
    weight: float | None = None
    bmi: float | None = None
    marital_status: str | None = None
    occupation: str | None = None
    address: str | None = None
    emergency_contact: str | None = None

class PatientCreate(PatientBase):
    user_id: int | None = None

class PatientUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: str | None = None
    blood_group: str | None = None
    height: float | None = None
    weight: float | None = None
    bmi: float | None = None
    marital_status: str | None = None
    occupation: str | None = None
    address: str | None = None
    emergency_contact: str | None = None

class PatientResponse(PatientBase):
    patient_id: int
    unique_patient_code: str
    user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =======================
# HEALTH METRIC
# =======================
class HealthMetricBase(BaseModel):
    metric_name: str
    value: float | None = None
    unit: str | None = None
    reference_min: float | None = None
    reference_max: float | None = None
    status: str | None = None

class HealthMetricResponse(HealthMetricBase):
    id: str
    patient_id: int
    document_id: str | None = None
    recorded_at: datetime
    class Config:
        from_attributes = True

class PatientDetailResponse(PatientResponse):
    lifestyle: LifestyleResponse | None = None
    medical_history: list[MedicalHistoryResponse] = []
    family_history: list[FamilyHistoryResponse] = []
    allergies: list[AllergyResponse] = []
    medications: list[MedicationResponse] = []
    surgeries: list[SurgeryResponse] = []
    vaccinations: list[VaccinationResponse] = []
    appointments: list[AppointmentResponse] = []
    health_metrics: list[HealthMetricResponse] = []
