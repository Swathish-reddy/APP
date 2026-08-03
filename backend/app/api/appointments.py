from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.db.models import Appointment, Patient, User
from app.api.deps import get_current_user

router = APIRouter()

class AppointmentCreate(BaseModel):
    doctor_id: str
    hospital_id: str
    date: str
    time: str
    consultation_type: str

@router.post("/book/{patient_id}")
async def book_appointment(
    patient_id: int,
    booking: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    patient = pat_res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_app = Appointment(
        patient_id=patient_id,
        date=booking.date,
        time=booking.time,
        doctor=booking.doctor_id, # Actually should fetch doctor name from doctor_id
        purpose=booking.consultation_type,
        hospital=booking.hospital_id,
        status="SCHEDULED"
    )
    db.add(new_app)
    await db.commit()
    return {"message": "Appointment booked successfully", "appointment_id": new_app.id}

@router.get("/{patient_id}")
async def get_appointments(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = await db.execute(select(Appointment).where(Appointment.patient_id == patient_id).order_by(Appointment.id.desc()))
    return results.scalars().all()

@router.put("/{appointment_id}/status")
async def update_status(
    appointment_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = res.scalars().first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    await db.commit()
    return {"message": f"Appointment status updated to {status}"}
