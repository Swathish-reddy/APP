import random

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import DoctorProfile, HospitalProfile
from app.db.session import get_db

router = APIRouter()

async def seed_data_if_empty(db: AsyncSession):
    docs = await db.execute(select(DoctorProfile).limit(1))
    if not docs.scalars().first():
        # Seed Hospitals
        h1 = HospitalProfile(name="City General Hospital", distance_km=2.4, rating=4.8, emergency_available=True, icu_available=True, departments=["Cardiology", "Neurology", "Orthopedics"])
        h2 = HospitalProfile(name="St. Jude Medical Center", distance_km=5.1, rating=4.5, emergency_available=True, icu_available=False, departments=["Pediatrics", "Oncology"])
        db.add_all([h1, h2])
        await db.commit()
        
        # Seed Doctors
        d1 = DoctorProfile(name="Dr. Sarah Jenkins", specialization="Cardiologist", hospital_id=h1.id, experience_years=14, consultation_fee=150.0, rating=4.9, languages="English, Spanish", gender="Female")
        d2 = DoctorProfile(name="Dr. Mark Vance", specialization="Endocrinologist", hospital_id=h1.id, experience_years=8, consultation_fee=120.0, rating=4.7, languages="English", gender="Male")
        d3 = DoctorProfile(name="Dr. Emily Chen", specialization="General Practitioner", hospital_id=h2.id, experience_years=5, consultation_fee=80.0, rating=4.6, languages="English, Mandarin", gender="Female")
        db.add_all([d1, d2, d3])
        await db.commit()

@router.get("/nearby")
async def get_nearby_doctors(
    specialty: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    await seed_data_if_empty(db)
    query = select(DoctorProfile, HospitalProfile).outerjoin(HospitalProfile, DoctorProfile.hospital_id == HospitalProfile.id)
    if specialty:
        query = query.where(DoctorProfile.specialization.ilike(f"%{specialty}%"))
    
    results = await db.execute(query)
    doctors = []
    for doc, hosp in results.all():
        doctors.append({
            "id": doc.id,
            "name": doc.name,
            "specialization": doc.specialization,
            "experience_years": doc.experience_years,
            "consultation_fee": doc.consultation_fee,
            "rating": doc.rating,
            "languages": doc.languages,
            "gender": doc.gender,
            "telemedicine_available": doc.telemedicine_available,
            "available_today": doc.available_today,
            "hospital": hosp.name if hosp else "Independent Clinic",
            "distance_km": hosp.distance_km if hosp else round(random.uniform(1.0, 15.0), 1)
        })
    return doctors

@router.get("/hospitals")
async def get_nearby_hospitals(db: AsyncSession = Depends(get_db)):
    await seed_data_if_empty(db)
    results = await db.execute(select(HospitalProfile))
    return results.scalars().all()
