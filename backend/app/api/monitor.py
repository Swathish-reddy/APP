from fastapi import APIRouter, HTTPException, Query
import random
from typing import Dict, Any, List
from pydantic import BaseModel
from app.db.db import patients_db, CONNECTED_DEVICES_DB
from app.services.live_monitor import (
    generate_live_stream,
    get_connected_devices,
    get_health_alerts,
    init_mock_patient_for_monitoring,
    get_ai_predictions,
    scan_nearby_devices
)

router = APIRouter()

class EventPayload(BaseModel):
    event_type: str

class WearablePayload(BaseModel):
    device_name: str
    device_type: str

@router.get("/patients/{patient_id}/stream")
def get_stream(patient_id: str, event: str = Query(None)):
    init_mock_patient_for_monitoring(patient_id)
    # event is used to optionally inject an anomaly during the poll
    return generate_live_stream(patient_id, event)

@router.get("/patients/{patient_id}/devices")
def list_devices(patient_id: str):
    init_mock_patient_for_monitoring(patient_id)
    return get_connected_devices(patient_id)

@router.post("/patients/{patient_id}/devices")
def connect_device(patient_id: str, payload: WearablePayload):
    init_mock_patient_for_monitoring(patient_id)
    
    new_device = {
        "id": f"DEV{random.randint(100, 999)}",
        "type": payload.device_name,
        "battery": 100,
        "status": "Connected",
        "last_sync": "Just now",
        "signal_strength": random.randint(85, 100)
    }
    
    # Prepend the new device
    CONNECTED_DEVICES_DB[patient_id].insert(0, new_device)
    
    return {"status": "success", "device": new_device}

@router.post("/patients/{patient_id}/devices/{device_id}/disconnect")
def disconnect_device(patient_id: str, device_id: str):
    init_mock_patient_for_monitoring(patient_id)
    devices = CONNECTED_DEVICES_DB.get(patient_id, [])
    # Remove the device
    CONNECTED_DEVICES_DB[patient_id] = [d for d in devices if d.get("id") != device_id]
    return {"status": "disconnected", "device_id": device_id}

@router.get("/patients/{patient_id}/devices/scan")
def scan_devices(patient_id: str):
    init_mock_patient_for_monitoring(patient_id)
    return scan_nearby_devices(patient_id)

@router.get("/patients/{patient_id}/predictions")
def get_predictions(patient_id: str):
    init_mock_patient_for_monitoring(patient_id)
    return get_ai_predictions(patient_id)

@router.get("/patients/{patient_id}/alerts")
def list_alerts(patient_id: str):
    init_mock_patient_for_monitoring(patient_id)
    return get_health_alerts(patient_id)

@router.post("/patients/{patient_id}/simulate-event")
def trigger_event(patient_id: str, payload: EventPayload):
    init_mock_patient_for_monitoring(patient_id)
        
    # Manually trigger a massive stream update with the anomaly
    stream = generate_live_stream(patient_id, payload.event_type)
    return {"status": "Event triggered", "stream": stream}
