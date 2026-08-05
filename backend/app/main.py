from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
import random
import json
from contextlib import asynccontextmanager
from app.core.config import settings
from sqlalchemy import select, func
from app.db.session import AsyncSessionLocal
from app.db.models import Patient, DoctorProfile, HospitalProfile, HealthEvent

from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.documents import router as documents_router
from app.api.uhie import router as uhie_router
from app.api.wearables import router as wearables_router
from app.api.twin import router as twin_router
from app.api.simulator import router as simulator_router
from app.api.risk_intelligence import router as risk_router
from app.api.cdss import router as cdss_router
from app.api.nutrition import router as nutrition_router
from app.api.navigator import router as navigator_router
from app.api.monitor import router as monitor_router
from app.api.intelligence import router as intelligence_router
from app.api.population import router as population_router
from app.api.medications import router as medications_router
from app.api.hospital import router as hospital_router
from app.api.diet import router as diet_router
from app.api.emergency import router as emergency_router
from app.api.overview import router as overview_router
from app.api.analytics import router as analytics_router
from app.api.doctors import router as doctors_router
from app.api.appointments import router as appointments_router
from app.core.events import event_bus
from app.services.orchestrator import init_orchestrator

from app.db.session import engine
from app.db.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start the event bus and initialize orchestrator
    event_bus.start()
    init_orchestrator()
    
    yield
    
    # Shutdown event bus
    event_bus.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CogniVueX AI – Clinical Decision Support & Digital Twin Healthcare Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(patients_router, prefix=f"{settings.API_V1_STR}/patients", tags=["patients"])
app.include_router(documents_router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(uhie_router, prefix=f"{settings.API_V1_STR}/uhie", tags=["uhie"])
app.include_router(wearables_router, prefix=f"{settings.API_V1_STR}/wearables", tags=["wearables"])
app.include_router(twin_router, prefix=f"{settings.API_V1_STR}/twin", tags=["twin"])
app.include_router(simulator_router, prefix=f"{settings.API_V1_STR}/simulator", tags=["simulator"])
app.include_router(risk_router, prefix=f"{settings.API_V1_STR}/risk", tags=["risk"])
app.include_router(cdss_router, prefix=f"{settings.API_V1_STR}/cdss", tags=["cdss"])
app.include_router(nutrition_router, prefix=f"{settings.API_V1_STR}/nutrition", tags=["nutrition"])
app.include_router(navigator_router, prefix=f"{settings.API_V1_STR}/navigator", tags=["navigator"])
app.include_router(monitor_router, prefix=f"{settings.API_V1_STR}/monitor", tags=["monitor"])
app.include_router(intelligence_router, prefix=f"{settings.API_V1_STR}/intelligence", tags=["intelligence"])
app.include_router(population_router, prefix=f"{settings.API_V1_STR}/population", tags=["population"])
app.include_router(medications_router, prefix=f"{settings.API_V1_STR}/medications", tags=["medications"])
app.include_router(hospital_router, prefix=f"{settings.API_V1_STR}/hospital", tags=["hospital"])
app.include_router(diet_router, prefix=f"{settings.API_V1_STR}/diet", tags=["diet"])
app.include_router(emergency_router, prefix=f"{settings.API_V1_STR}/emergency", tags=["emergency"])
app.include_router(overview_router, prefix=f"{settings.API_V1_STR}/overview", tags=["overview"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(doctors_router, prefix=f"{settings.API_V1_STR}/doctors", tags=["doctors"])
app.include_router(appointments_router, prefix=f"{settings.API_V1_STR}/appointments", tags=["appointments"])
from app.core.middleware import SecurityHeadersMiddleware, IPBlockMiddleware

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(SecurityHeadersMiddleware)
# app.add_middleware(IPBlockMiddleware)



# --- REST ENDPOINTS ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CogniVueX AI Platform Backend",
        "version": "1.0.0"
    }





# --- WEBSOCKETS SENSOR STREAMER ---

@app.websocket("/ws/vitals/{patient_id}")
async def websocket_vitals_streamer(websocket: WebSocket, patient_id: str):
    """
    WebSocket connection to stream patient's live IoT sensor vital metrics.
    Perturbs baseline metrics slightly every second to simulate active feeds.
    Also sends simulated ECG waves.
    """
    if patient_id not in patients_db:
        await websocket.close(code=1008, reason="Patient ID not found")
        return
        
    await websocket.accept()
    patient = patients_db[patient_id]
    
    # Store initial vitals to perturb
    base_hr = patient["vitals"].get("heart_rate", 75)
    base_sys = patient["vitals"].get("systolic_bp", 120)
    base_dia = patient["vitals"].get("diastolic_bp", 80)
    base_spo2 = patient["vitals"].get("spo2", 98)
    base_temp = patient["vitals"].get("temperature", 36.6)
    
    try:
        while True:
            # Random walk fluctuations (simulated IoT sensor drift)
            hr = int(max(45, min(140, base_hr + random.choice([-2, -1, 0, 1, 2]))))
            sys_bp = int(max(90, min(190, base_sys + random.choice([-3, -1, 0, 1, 3]))))
            dia_bp = int(max(55, min(110, base_dia + random.choice([-2, -1, 0, 1, 2]))))
            spo2 = int(max(85, min(100, base_spo2 + random.choice([-1, 0, 0, 0, 1]))))
            temp = round(max(35.5, min(40.0, base_temp + random.choice([-0.1, 0.0, 0.1]))), 1)
            resp = int(max(10, min(30, patient["vitals"].get("respiratory_rate", 16) + random.choice([-1, 0, 1]))))
            
            # Generate a mock ECG coordinate waveform buffer
            # A cycle of 20 points showing P, Q, R, S, T complex
            ecg_buffer = [0, 0, 2, -1, 10, -3, 0, 1, 3, 0, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0]
            # Add small random noise to points
            ecg_buffer = [round(v + random.uniform(-0.3, 0.3), 2) for v in ecg_buffer]
            
            # Formulate severity alerts
            alert_level = "Low Risk"
            alert_msg = ""
            if hr > 115 or sys_bp > 160 or spo2 < 91:
                alert_level = "Critical Risk"
                alert_msg = f"CRITICAL: Anomalous vital trigger. HR: {hr} bpm, BP: {sys_bp}/{dia_bp} mmHg, SpO2: {spo2}%."
            elif hr > 100 or sys_bp > 140 or spo2 < 94:
                alert_level = "High Risk"
                alert_msg = "WARNING: Elevated vitals threshold exceeded. Rest recommended."
            elif hr > 90 or sys_bp > 130 or spo2 < 96:
                alert_level = "Moderate Risk"
                alert_msg = "Elevated activity or stress indicators."

            data = {
                "patient_id": patient_id,
                "vitals": {
                    "heart_rate": hr,
                    "systolic_bp": sys_bp,
                    "diastolic_bp": dia_bp,
                    "spo2": spo2,
                    "temperature": temp,
                    "respiratory_rate": resp,
                    "glucose": patient["vitals"].get("glucose", 90)
                },
                "ecg_points": ecg_buffer,
                "alert": {
                    "level": alert_level,
                    "message": alert_msg
                }
            }
            
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(1.0)
            
    except WebSocketDisconnect:
        print(f"WebSocket client disconnected for patient {patient_id}")
    except Exception as e:
        print(f"WebSocket execution error: {e}")

@app.websocket("/ws/events/{patient_id}")
async def websocket_events_streamer(websocket: WebSocket, patient_id: str):
    """
    WebSocket connection to stream global patient events.
    """
    await websocket.accept()
    
    # We create a local queue to listen to the event bus
    queue = asyncio.Queue()
    
    async def handler(payload):
        if str(payload.get("patient_id")) == str(patient_id):
            await queue.put(payload)

    # Subscribe to interesting events
    from app.core.events import EVENT_TWIN_UPDATED, EVENT_DOCUMENT_UPLOADED
    event_bus.subscribe(EVENT_TWIN_UPDATED, handler)
    event_bus.subscribe(EVENT_DOCUMENT_UPLOADED, handler)

    try:
        while True:
            event_payload = await queue.get()
            await websocket.send_text(json.dumps({
                "type": "SYSTEM_EVENT",
                "payload": event_payload
            }))
    except WebSocketDisconnect:
        print(f"Events WebSocket client disconnected for patient {patient_id}")
    except Exception as e:
        print(f"Events WebSocket execution error: {e}")

# --- HOSPITAL COMMAND CENTER WEBSOCKET ---

@app.websocket("/ws/hospital/{hospital_id}")
async def websocket_hospital_streamer(websocket: WebSocket, hospital_id: str):
    """
    WebSocket connection to stream hospital-wide live data.
    """
    await websocket.accept()
    
    try:
        while True:
            async with AsyncSessionLocal() as db:
                total_patients = await db.scalar(select(func.count(Patient.patient_id))) or 0
                total_doctors = await db.scalar(select(func.count(DoctorProfile.id))) or 0
                
                # Mock some realistic AI metrics for demonstration purposes until all tables exist
                emergency_patients = int(total_patients * 0.15)
                icu_occupancy = min(100, 75 + (total_patients % 15))
                ward_occupancy = min(100, 60 + (total_patients % 20))
                
                current_metrics = {
                    "total_patients": total_patients,
                    "emergency_patients": emergency_patients,
                    "icu_occupancy_percent": icu_occupancy,
                    "ward_occupancy_percent": ward_occupancy,
                    "emergency_wait_time_mins": 15 + (emergency_patients % 10),
                    "avg_length_of_stay_days": 4.5,
                    "admissions_today": int(total_patients * 0.05),
                    "discharges_today": int(total_patients * 0.04),
                    "current_surgeries": int(total_doctors * 0.2),
                    "available_beds": max(0, 500 - total_patients),
                    "critical_alerts": 2,
                    "doctor_availability_percent": 85.0,
                    "nurse_availability_percent": 90.0,
                    "hospital_performance_score": 92,
                    "ai_confidence_percent": 97.5,
                    "emergency_status": "Elevated" if emergency_patients > 50 else "Normal",
                    "flow_stats": {
                        "admissions_hr": random.randint(1, 5),
                        "transfers_hr": random.randint(0, 3),
                        "discharges_hr": random.randint(1, 4),
                        "er_queue": max(0, emergency_patients - 20),
                        "or_queue": 2,
                    },
                    "capacity_intelligence": {
                        "bed_shortage_risk": "Low",
                        "predicted_peak_occupancy_time": "14:00",
                        "overflow_risk_departments": ["None"],
                        "load_balancing_recommendation": "Optimal"
                    },
                    "workforce_intelligence": {
                        "doctors": [],
                        "ai_reassignment_recommendation": "Staffing optimal",
                        "burnout_risk_count": 0
                    }
                }

                data = {
                    "hospital_id": hospital_id,
                    "metrics": current_metrics,
                }
                
                await websocket.send_text(json.dumps(data))
            
            await asyncio.sleep(2.0)
            
    except WebSocketDisconnect:
        print(f"Hospital WebSocket client disconnected for hospital {hospital_id}")
    except Exception as e:
        print(f"Hospital WebSocket execution error: {e}")
        import traceback
        traceback.print_exc()

