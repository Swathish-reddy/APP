import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


# ─── AUTH ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="patient") # e.g., admin, doctor, patient
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patients = relationship("Patient", back_populates="owner", cascade="all, delete")


class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, index=True, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempt_count = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── PATIENT ─────────────────────────────────────────────────────────────────


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    unique_patient_code = Column(String, unique=True, index=True,
                                 default=lambda: f"PAT-{str(uuid.uuid4())[:8].upper()}")
    full_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    height = Column(Float, nullable=True)   # cm
    weight = Column(Float, nullable=True)   # kg
    bmi = Column(Float, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    smoking_status = Column(String, nullable=True)
    alcohol_use = Column(String, nullable=True)
    exercise_level = Column(String, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    diet_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="patients")
    documents = relationship("Document", back_populates="patient", cascade="all, delete")
    health_metrics = relationship("HealthMetric", back_populates="patient", cascade="all, delete")
    recommendations = relationship("AIRecommendation", back_populates="patient", cascade="all, delete")
    timeline_events = relationship("HealthTimeline", back_populates="patient", cascade="all, delete")
    digital_twin = relationship("DigitalTwin", back_populates="patient", uselist=False, cascade="all, delete")
    twin_predictions = relationship("TwinPrediction", back_populates="patient", cascade="all, delete")
    disease_predictions = relationship("DiseasePrediction", back_populates="patient", cascade="all, delete")
    simulation_scenarios = relationship("SimulationScenario", back_populates="patient", cascade="all, delete")
    medical_history = relationship("MedicalHistory", back_populates="patient", cascade="all, delete")
    family_history = relationship("FamilyHistory", back_populates="patient", cascade="all, delete")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete")
    allergies = relationship("Allergy", back_populates="patient", cascade="all, delete")
    surgeries = relationship("Surgery", back_populates="patient", cascade="all, delete")
    vaccinations = relationship("Vaccination", back_populates="patient", cascade="all, delete")
    clinical_notes = relationship("ClinicalNote", back_populates="patient", cascade="all, delete")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete")
    lifestyle = relationship("Lifestyle", back_populates="patient", uselist=False, cascade="all, delete")
    aliases = relationship("PatientAlias", back_populates="patient", cascade="all, delete")
    audit_logs = relationship("AuditLog", back_populates="patient", cascade="all, delete")


# ─── PATIENT ALIAS ────────────────────────────────────────────────────────────

class PatientAlias(Base):
    __tablename__ = "patient_aliases"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    alias_name = Column(String, nullable=False)
    source = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="aliases")
# ─── DOCUMENTS (Reports) ─────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    category = Column(String, nullable=True)
    report_type = Column(String, nullable=True)
    status = Column(String, default="Processing")
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    extracted_text = Column(Text, nullable=True)
    structured_data = Column(JSON, nullable=True)
    abnormalities = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="documents")


# ─── HEALTH METRICS ──────────────────────────────────────────────────────────

class HealthMetric(Base):
    """Single source of truth for all extracted lab values."""
    __tablename__ = "health_metrics"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    metric_name = Column(String, nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    reference_min = Column(Float, nullable=True)
    reference_max = Column(Float, nullable=True)
    status = Column(String, nullable=True)   # Normal | High | Low | Critical
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="health_metrics")


# ─── AI RECOMMENDATIONS ───────────────────────────────────────────────────────

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)   # Lifestyle | Tests | Specialist | Medication | Diet
    priority = Column(String, default="Medium") # High | Medium | Low
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    action_items = Column(JSON, nullable=True)
    evidence = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="recommendations")


# ─── HEALTH TIMELINE ──────────────────────────────────────────────────────────

class HealthTimeline(Base):
    __tablename__ = "health_timeline"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False)  # report_uploaded | metric_abnormal | ai_analysis | recommendation
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="info")    # info | warning | danger | success
    event_meta = Column(JSON, nullable=True)     # renamed from metadata to avoid SQLAlchemy conflict
    event_date = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="timeline_events")


# ─── DIGITAL TWIN ─────────────────────────────────────────────────────────────

class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"),
                        nullable=False, unique=True)
    health_score = Column(Integer, default=100)
    biological_age = Column(Integer, nullable=True)
    cardiac_health = Column(Integer, default=100)
    renal_health = Column(Integer, default=100)
    liver_health = Column(Integer, default=100)
    lung_health = Column(Integer, default=100)
    brain_health = Column(Integer, default=100)
    metabolic_health = Column(Integer, default=100)
    overall_status = Column(String, default="Optimal")
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="digital_twin")


# ─── TWIN PREDICTIONS ─────────────────────────────────────────────────────────

class TwinPrediction(Base):
    __tablename__ = "twin_predictions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String, nullable=False)
    current_value = Column(Float, nullable=True)
    projected_value = Column(Float, nullable=True)
    timeframe_months = Column(Integer, nullable=True)
    confidence_level = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="twin_predictions")


# ─── DISEASE PREDICTIONS ──────────────────────────────────────────────────────

class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    disease_name = Column(String, nullable=False)
    risk_percent = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # Low | Moderate | High | Critical
    key_factors = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="disease_predictions")


# ─── SIMULATION ───────────────────────────────────────────────────────────────

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    scenario_name = Column(String, nullable=False)
    modifiers = Column(JSON, nullable=False)
    projected_health_score = Column(Integer, nullable=False)
    projected_biological_age = Column(Integer, nullable=False)
    xai_insights = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="simulation_scenarios")


# ─── CLINICAL ─────────────────────────────────────────────────────────────────

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    disease_name = Column(String, nullable=False)
    diagnosis_date = Column(String, nullable=True)
    status = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="medical_history")


class FamilyHistory(Base):
    __tablename__ = "family_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    relation = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    age_at_diagnosis = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="family_history")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    prescribing_doctor = Column(String, nullable=True)
    start_date = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="medications")


class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    allergen = Column(String, nullable=False)
    severity = Column(String, nullable=True)
    reaction = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="allergies")


class Surgery(Base):
    __tablename__ = "surgeries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    surgery_name = Column(String, nullable=False)
    surgery_date = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    surgeon = Column(String, nullable=True)
    outcome = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="surgeries")


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    vaccine_name = Column(String, nullable=False)
    dose = Column(String, nullable=True)
    date_administered = Column(String, nullable=True)
    next_due = Column(String, nullable=True)
    administered_by = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="vaccinations")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    note_date = Column(String, nullable=True)
    author = Column(String, nullable=True)
    note_type = Column(String, nullable=True)   # SOAP | Discharge | Consultation
    content = Column(Text, nullable=False)

    patient = relationship("Patient", back_populates="clinical_notes")


class Lifestyle(Base):
    __tablename__ = "lifestyles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), unique=True)
    smoking_status = Column(String, nullable=True)      # Never | Former | Current Smoker
    alcohol_consumption = Column(String, nullable=True)  # None | Occasional | Frequent | Heavy
    exercise_frequency = Column(String, nullable=True)   # Sedentary | Light | Moderate | Active
    diet_type = Column(String, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    stress_level = Column(String, nullable=True)         # Low | Moderate | High
    occupation = Column(String, nullable=True)
    average_steps_day = Column(Integer, nullable=True)

    patient = relationship("Patient", back_populates="lifestyle")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    date = Column(String, nullable=False)
    time = Column(String, nullable=True)
    doctor = Column(String, nullable=True)
    purpose = Column(String, nullable=True)
    status = Column(String, default="SCHEDULED")
    hospital = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="appointments")


# ─── WEARABLES ────────────────────────────────────────────────────────────────

class WearableDevice(Base):
    __tablename__ = "wearable_devices"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    device_type = Column(String, nullable=False)   # Smartwatch | CGM | BP Monitor | Pulse Oximeter
    device_name = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    data_points = relationship("WearableData", back_populates="device", cascade="all, delete")


class WearableData(Base):
    __tablename__ = "wearable_data"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, ForeignKey("wearable_devices.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metric_type = Column(String, nullable=False)   # HeartRate | SpO2 | Steps | Sleep | BloodGlucose
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)

    device = relationship("WearableDevice", back_populates="data_points")


# ─── UHIE / KNOWLEDGE GRAPH ───────────────────────────────────────────────────

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    node_type = Column(String, nullable=False)   # Symptom | Condition | Medication | Lab | Lifestyle
    name = Column(String, nullable=False)
    value = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    source = Column(String, nullable=True)       # document_id | wearable | manual
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    source_node_id = Column(String, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(String, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String, nullable=False)  # causes | treats | indicates | correlates
    weight = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HealthStateSnapshot(Base):
    __tablename__ = "health_state_snapshots"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    overall_risk = Column(Float, nullable=True)
    metabolic_risk = Column(Float, nullable=True)
    cardiac_risk = Column(Float, nullable=True)
    renal_risk = Column(Float, nullable=True)
    state_vector = Column(JSON, nullable=True)    # full normalized feature vector
    anomaly_score = Column(Float, nullable=True)
    active_alerts = Column(JSON, nullable=True)   # list of active alert strings


class HealthEvent(Base):
    __tablename__ = "health_events"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    event_type = Column(String, nullable=False)   # anomaly | alert | milestone | correlation
    source = Column(String, nullable=True)        # wearable | lab | document | manual
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="info")     # info | warning | critical
    resolved = Column(Boolean, default=False)
    event_data = Column(JSON, nullable=True)


class HealthCorrelation(Base):
    __tablename__ = "health_correlations"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metric_a = Column(String, nullable=False)
    metric_b = Column(String, nullable=False)
    correlation_coefficient = Column(Float, nullable=True)
    clinical_significance = Column(String, nullable=True)
    insight = Column(Text, nullable=True)


# ─── FUSION CENTER & LINEAGE ──────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String, nullable=False)   # INGEST, MERGE, CONFLICT_RESOLUTION, BLOCK
    source = Column(String, nullable=False)        # API, HL7, FHIR, CSV
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON, nullable=True)
    status = Column(String, default="SUCCESS")     # SUCCESS, FAILED, BLOCKED

    patient = relationship("Patient", back_populates="audit_logs")


class DataLineage(Base):
    __tablename__ = "data_lineage"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String, nullable=False)   # Patient, Medication, Allergy
    entity_id = Column(String, nullable=False)     # ID of the record in its respective table
    original_source = Column(String, nullable=False) # e.g. Central Hospital EHR
    source_id = Column(String, nullable=True)      # e.g. Patient ID in the external system
    ingested_at = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(Integer, default=1)
    confidence = Column(Float, nullable=True)

# ─── DOCTORS & HOSPITALS ──────────────────────────────────────────────────────

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    hospital_id = Column(String, ForeignKey("hospital_profiles.id", ondelete="SET NULL"), nullable=True)
    experience_years = Column(Integer, nullable=True)
    consultation_fee = Column(Float, nullable=True)
    rating = Column(Float, nullable=True)
    languages = Column(String, nullable=True)
    telemedicine_available = Column(Boolean, default=True)
    gender = Column(String, nullable=True)
    available_today = Column(Boolean, default=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

class HospitalProfile(Base):
    __tablename__ = "hospital_profiles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    distance_km = Column(Float, nullable=True)
    rating = Column(Float, nullable=True)
    emergency_available = Column(Boolean, default=True)
    icu_available = Column(Boolean, default=True)
    departments = Column(JSON, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
