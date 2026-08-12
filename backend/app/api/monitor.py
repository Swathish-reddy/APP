
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel

from app.services.live_monitor import (
    generate_live_stream,
    get_ai_predictions,
    get_health_alerts,
    scan_nearby_devices,
)

router = APIRouter()

class EventPayload(BaseModel):
    event_type: str

class WearablePayload(BaseModel):
    device_name: str
    device_type: str

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.models import WearableDevice
from app.services.patient_service import get_patient_profile_dict

@router.get("/patients/{patient_id}/stream")
async def get_stream(patient_id: str, event: str = Query(None), db: AsyncSession = Depends(get_db)):
    patient = await get_patient_profile_dict(patient_id, db)
    # event is used to optionally inject an anomaly during the poll
    return generate_live_stream(patient_id, patient, event)

@router.get("/patients/{patient_id}/devices")
async def list_devices(patient_id: str, db: AsyncSession = Depends(get_db)):
    pid_int = int(patient_id.replace("P", "")) if patient_id.startswith("P") else int(patient_id)
    res = await db.execute(select(WearableDevice).where(WearableDevice.patient_id == pid_int))
    devices = res.scalars().all()
    return [
        {
            "id": d.id,
            "type": d.device_type,
            "device_name": d.device_name,
            "battery": 100,
            "status": "Connected" if d.is_active else "Disconnected",
            "last_sync": str(d.last_sync) if d.last_sync else "Never"
        }
        for d in devices
    ]

@router.post("/patients/{patient_id}/devices")
async def connect_device(patient_id: str, payload: WearablePayload, db: AsyncSession = Depends(get_db)):
    pid_int = int(patient_id.replace("P", "")) if patient_id.startswith("P") else int(patient_id)
    new_device = WearableDevice(
        patient_id=pid_int,
        device_type=payload.device_type,
        device_name=payload.device_name,
        is_active=True
    )
    db.add(new_device)
    await db.commit()
    await db.refresh(new_device)
    
    return {"status": "success", "device": {
        "id": new_device.id,
        "type": new_device.device_type,
        "device_name": new_device.device_name,
        "battery": 100,
        "status": "Connected",
        "last_sync": "Just now"
    }}

@router.post("/patients/{patient_id}/devices/{device_id}/disconnect")
async def disconnect_device(patient_id: str, device_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WearableDevice).where(WearableDevice.id == device_id))
    dev = res.scalars().first()
    if dev:
        dev.is_active = False
        await db.commit()
    return {"status": "disconnected", "device_id": device_id}

@router.get("/patients/{patient_id}/devices/scan")
def scan_devices(patient_id: str):
    return scan_nearby_devices(patient_id)

@router.get("/patients/{patient_id}/predictions")
async def get_predictions(patient_id: str, db: AsyncSession = Depends(get_db)):
    patient = await get_patient_profile_dict(patient_id, db)
    return get_ai_predictions(patient)

@router.get("/patients/{patient_id}/alerts")
async def list_alerts(patient_id: str, db: AsyncSession = Depends(get_db)):
    # Still pulls from memory for now since alerts are ephemeral
    return get_health_alerts(patient_id)

@router.post("/patients/{patient_id}/simulate-event")
async def trigger_event(patient_id: str, payload: EventPayload, db: AsyncSession = Depends(get_db)):
    patient = await get_patient_profile_dict(patient_id, db)
    # Manually trigger a massive stream update with the anomaly
    stream = generate_live_stream(patient_id, patient, payload.event_type)
    return {"status": "Event triggered", "stream": stream}
