from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.db.session import get_db
from app.db.models import DoctorProfile, HospitalProfile, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/doctors")
async def find_doctors(
    specialty: Optional[str] = None,
    max_distance: Optional[float] = None,
    available_today: Optional[bool] = None,
    telemedicine: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(DoctorProfile)
    
    if specialty:
        query = query.where(DoctorProfile.specialization.ilike(f"%{specialty}%"))
    if available_today is not None:
        query = query.where(DoctorProfile.available_today == available_today)
    if telemedicine is not None:
        query = query.where(DoctorProfile.telemedicine_available == telemedicine)
        
    res = await db.execute(query)
    doctors = res.scalars().all()
    
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "hospital_id": d.hospital_id,
            "experience_years": d.experience_years,
            "consultation_fee": d.consultation_fee,
            "rating": d.rating,
            "languages": d.languages.split(",") if d.languages else [],
            "telemedicine_available": d.telemedicine_available,
            "available_today": d.available_today,
            "gender": d.gender,
            "distance": 3.2 # Mocked distance logic for MVP since we don't have PostGIS enabled
        }
        for d in doctors
    ]

@router.get("/hospitals")
async def find_hospitals(
    specialty: Optional[str] = None,
    emergency_available: Optional[bool] = None,
    icu_available: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(HospitalProfile)
    
    if emergency_available is not None:
        query = query.where(HospitalProfile.emergency_available == emergency_available)
    if icu_available is not None:
        query = query.where(HospitalProfile.icu_available == icu_available)
        
    res = await db.execute(query)
    hospitals = res.scalars().all()
    
    # Filter departments manually since it's JSON
    result = []
    for h in hospitals:
        match = True
        if specialty and h.departments:
            if specialty.lower() not in [d.lower() for d in h.departments]:
                match = False
        if match:
            result.append({
                "id": h.id,
                "name": h.name,
                "distance_km": h.distance_km,
                "rating": h.rating,
                "emergency_available": h.emergency_available,
                "icu_available": h.icu_available,
                "departments": h.departments
            })
            
    return result

@router.get("/doctors/{doctor_id}")
async def get_doctor_details(
    doctor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(DoctorProfile).where(DoctorProfile.id == doctor_id))
    doctor = res.scalars().first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    # Get hospital info if available
    hospital = None
    if doctor.hospital_id:
        h_res = await db.execute(select(HospitalProfile).where(HospitalProfile.id == doctor.hospital_id))
        h = h_res.scalars().first()
        if h:
            hospital = {"id": h.id, "name": h.name}
            
    # Mocking available slots and reviews for enterprise feel
    slots = ["09:00 AM", "10:30 AM", "01:00 PM", "04:30 PM"]
    reviews = [
        {"rating": 5, "comment": "Excellent and attentive."},
        {"rating": 4, "comment": "Very knowledgeable."}
    ]
    
    return {
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "experience_years": doctor.experience_years,
        "consultation_fee": doctor.consultation_fee,
        "rating": doctor.rating,
        "languages": doctor.languages.split(",") if doctor.languages else [],
        "telemedicine_available": doctor.telemedicine_available,
        "available_today": doctor.available_today,
        "gender": doctor.gender,
        "hospital": hospital,
        "available_slots": slots,
        "reviews": reviews
    }
