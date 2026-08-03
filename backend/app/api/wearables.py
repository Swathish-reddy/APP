from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import random

from app.db.session import get_db
from app.db.models import Patient, WearableDevice, WearableData

router = APIRouter()

@router.post("/connect")
async def connect_device(patient_id: int, device_type: str, db: AsyncSession = Depends(get_db)):
    # Verify patient
    res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    if not res.scalars().first():
        raise HTTPException(status_code=404, detail="Patient not found")
        
    device = WearableDevice(patient_id=patient_id, device_type=device_type)
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return {"message": "Device connected successfully", "device": device}

@router.post("/{device_id}/sync")
async def sync_device_data(device_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WearableDevice).where(WearableDevice.id == device_id))
    device = res.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    device.last_sync = datetime.utcnow()
    
    # Generate 24 hours of simulated data points
    now = datetime.utcnow()
    data_points = []
    
    # Base baseline values
    base_hr = 70
    base_spo2 = 98
    
    for i in range(24):
        t = now - timedelta(hours=24-i)
        
        # Simulate sleep drop
        is_sleeping = 0 <= t.hour <= 7
        hr = base_hr - random.randint(10, 20) if is_sleeping else base_hr + random.randint(-5, 25)
        spo2 = base_spo2 - random.randint(1, 3) if is_sleeping else base_spo2 - random.randint(0, 1)
        
        # Introduce anomalous drop for the UHIE to catch
        if i == 5: # 5 AM (during sleep)
            spo2 = 91 # Abnormal
            
        data_points.extend([
            WearableData(device_id=device.id, patient_id=device.patient_id, timestamp=t, metric_type="HeartRate", value=hr, unit="bpm"),
            WearableData(device_id=device.id, patient_id=device.patient_id, timestamp=t, metric_type="SpO2", value=spo2, unit="%")
        ])
        
    # Activity and sleep aggregate
    data_points.extend([
        WearableData(device_id=device.id, patient_id=device.patient_id, timestamp=now, metric_type="Steps", value=random.randint(4000, 12000), unit="count"),
        WearableData(device_id=device.id, patient_id=device.patient_id, timestamp=now, metric_type="Sleep", value=round(random.uniform(5.5, 8.5), 1), unit="hours")
    ])
    
    db.add_all(data_points)
    await db.commit()
    return {"message": "Simulated data synced successfully", "data_points_generated": len(data_points)}

@router.get("/patient/{patient_id}")
async def get_patient_wearables(patient_id: int, db: AsyncSession = Depends(get_db)):
    d_res = await db.execute(select(WearableDevice).where(WearableDevice.patient_id == patient_id))
    devices = d_res.scalars().all()
    
    result = []
    for d in devices:
        # Get latest 24hr data for chart
        data_res = await db.execute(select(WearableData).where(WearableData.device_id == d.id).order_by(WearableData.timestamp.asc()))
        data = data_res.scalars().all()
        
        result.append({
            "device": d,
            "data": data
        })
        
    return result
