import datetime
import math
import random
from typing import Any

from app.db.db import (
    CONNECTED_DEVICES_DB,
    HEALTH_ALERTS_DB,
    LIVE_STREAMS_DB,
)

# Simulated ECG generation
def generate_ecg_wave(t: float, hr: int, anomaly: str = None) -> float:
    # A very basic synthetic ECG generator
    # P wave
    p_wave = 0.25 * math.sin(math.pi * (t - 0.15) / 0.1) if 0.1 < (t % 1) < 0.2 else 0
    # QRS complex
    qrs = 0
    if 0.4 < (t % 1) < 0.5:
        if 0.4 < (t % 1) < 0.43: qrs = -0.5
        elif 0.43 <= (t % 1) < 0.47: qrs = 2.5
        else: qrs = -0.5
    # T wave
    t_wave = 0.35 * math.sin(math.pi * (t - 0.6) / 0.2) if 0.5 < (t % 1) < 0.7 else 0
    
    val = p_wave + qrs + t_wave + random.uniform(-0.05, 0.05) # Add noise
    
    # Introduce anomalies
    if anomaly == "Afib":
        # Missing P wave, irregular R-R interval
        val = qrs + t_wave + random.uniform(-0.2, 0.2)
    elif anomaly == "PVC":
        # Premature Ventricular Contraction (wide, bizarre QRS)
        if 0.7 < (t % 1) < 0.9:
            val = 2.0 * math.sin(math.pi * (t - 0.7) / 0.2)
            
    return val

def generate_live_stream(patient_id: str, patient: dict, trigger_event: str = None) -> dict[str, Any]:
    vitals = patient["vitals"].copy()
    
    # Simulate fluctuations
    hr_fluctuation = random.randint(-2, 2)
    sys_fluctuation = random.randint(-3, 3)
    dia_fluctuation = random.randint(-2, 2)
    spo2_fluctuation = random.choice([0, 0, -1, 1])
    glucose_fluctuation = random.randint(-2, 2)
    
    # Apply standard fluctuations
    vitals["heart_rate"] = vitals.get("heart_rate", 70) + hr_fluctuation
    vitals["systolic_bp"] = vitals.get("systolic_bp", 120) + sys_fluctuation
    vitals["diastolic_bp"] = vitals.get("diastolic_bp", 80) + dia_fluctuation
    vitals["spo2"] = min(100, max(85, vitals.get("spo2", 98) + spo2_fluctuation))
    vitals["glucose"] = vitals.get("glucose", 90) + glucose_fluctuation
    
    anomaly_type = None
    
    # Handle injected emergencies
    if trigger_event == "Heart Attack":
        vitals["heart_rate"] = random.randint(140, 180)
        vitals["systolic_bp"] = random.randint(180, 220)
        vitals["spo2"] = random.randint(85, 90)
        anomaly_type = "PVC"
    elif trigger_event == "Severe Hypoglycemia":
        vitals["glucose"] = random.randint(40, 55)
        vitals["heart_rate"] = random.randint(100, 120)
    elif trigger_event == "Respiratory Failure":
        vitals["spo2"] = random.randint(75, 82)
        vitals["respiratory_rate"] = random.randint(28, 35)
        
    # Generate ECG Array (e.g. 50 data points representing 1 second)
    ecg_data = []
    base_t = datetime.datetime.now().timestamp()
    for i in range(50):
        t = (base_t + i * 0.02)
        freq_multiplier = vitals["heart_rate"] / 60.0
        val = generate_ecg_wave(t * freq_multiplier, vitals["heart_rate"], anomaly_type)
        ecg_data.append(val)
        
    # Store stream
    stream_data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "vitals": vitals,
        "ecg": ecg_data
    }
    
    if patient_id not in LIVE_STREAMS_DB:
        LIVE_STREAMS_DB[patient_id] = []
        
    LIVE_STREAMS_DB[patient_id].append(stream_data)
    # Keep only last 10
    if len(LIVE_STREAMS_DB[patient_id]) > 10:
        LIVE_STREAMS_DB[patient_id].pop(0)
        
    # Run Anomaly Engine
    detect_anomalies(patient_id, vitals, trigger_event)
        
    return stream_data

def detect_anomalies(patient_id: str, vitals: dict[str, Any], trigger_event: str = None):
    alerts = []
    timestamp = datetime.datetime.now().isoformat()
    
    if trigger_event == "Heart Attack":
        alerts.append({
            "severity": "Critical", 
            "type": "Cardiac Emergency", 
            "message": "Critical Arrhythmia and Hypertension detected. High probability of Myocardial Infarction.", 
            "time": timestamp,
            "confidence": 0.98,
            "recommended_action": "Administer emergency cardiac protocols.",
            "doctor_notification": "Emergency alert sent to Dr. Vance."
        })
    elif trigger_event == "Severe Hypoglycemia":
        alerts.append({
            "severity": "Critical", 
            "type": "Glucose Alert", 
            "message": f"Severe Hypoglycemia (Glucose: {vitals['glucose']} mg/dL).", 
            "time": timestamp,
            "confidence": 0.99,
            "recommended_action": "Immediate sugar intake required (IV Dextrose if unresponsive).",
            "doctor_notification": "Endocrinologist notified."
        })
    elif trigger_event == "Fall Detected":
        alerts.append({
            "severity": "High", 
            "type": "Impact Alert", 
            "message": "Sudden fall detected by Apple Watch. Patient unresponsive.", 
            "time": timestamp,
            "confidence": 0.95,
            "recommended_action": "Check patient responsiveness. Dispatch emergency services if no response.",
            "doctor_notification": "Emergency contacts notified."
        })
    else:
        # Standard dynamic thresholding
        if vitals["heart_rate"] > 120:
            alerts.append({"severity": "High", "type": "Tachycardia", "message": f"Heart rate elevated at {vitals['heart_rate']} bpm", "time": timestamp, "confidence": 0.92, "recommended_action": "Monitor ECG for arrhythmias."})
        elif vitals["heart_rate"] < 50:
            alerts.append({"severity": "Medium", "type": "Bradycardia", "message": f"Heart rate low at {vitals['heart_rate']} bpm", "time": timestamp, "confidence": 0.88, "recommended_action": "Evaluate for symptoms of fatigue or dizziness."})
            
        if vitals["systolic_bp"] > 160:
            alerts.append({"severity": "High", "type": "Hypertension", "message": f"Systolic BP critically high: {vitals['systolic_bp']} mmHg", "time": timestamp, "confidence": 0.95, "recommended_action": "Administer antihypertensive medication as prescribed."})
        elif vitals["systolic_bp"] < 90:
            alerts.append({"severity": "High", "type": "Hypotension", "message": f"Systolic BP dropped to {vitals['systolic_bp']} mmHg", "time": timestamp, "confidence": 0.93, "recommended_action": "Assess for shock or severe dehydration."})
            
        if vitals["spo2"] < 92:
            alerts.append({"severity": "High", "type": "Hypoxia", "message": f"SpO2 dropped to {vitals['spo2']}%", "time": timestamp, "confidence": 0.97, "recommended_action": "Initiate supplemental oxygen therapy."})
            
    if alerts:
        if patient_id not in HEALTH_ALERTS_DB:
            HEALTH_ALERTS_DB[patient_id] = []
        # Prepend
        HEALTH_ALERTS_DB[patient_id] = alerts + HEALTH_ALERTS_DB[patient_id]
        # Keep latest 50
        HEALTH_ALERTS_DB[patient_id] = HEALTH_ALERTS_DB[patient_id][:50]

def get_ai_predictions(patient: dict) -> dict[str, Any]:
    # Generate some dynamic mock AI predictions based on patient state
    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "health_score": random.randint(72, 85),
        "cardiovascular_risk": f"{random.randint(15, 30)}%",
        "disease_progression": "Stable",
        "predictions": [
            {"condition": "Sleep Apnea", "probability": 0.65, "trend": "Increasing", "timeframe": "6 months"},
            {"condition": "Hypertensive Crisis", "probability": 0.15, "trend": "Decreasing", "timeframe": "12 months"},
            {"condition": "Diabetic Neuropathy", "probability": 0.40, "trend": "Stable", "timeframe": "2 years"}
        ]
    }
        
def get_connected_devices(patient_id: str) -> list[dict[str, Any]]:
    devices = CONNECTED_DEVICES_DB.get(patient_id, [])
    # Simulate battery drain and random connection drops for demo
    for dev in devices:
        if random.random() < 0.05:
            dev["battery"] = max(0, dev["battery"] - 1)
        
        if dev["status"] == "Connected" and random.random() < 0.02:
             dev["status"] = "Disconnected"
             dev["signal_strength"] = 0
        elif dev["status"] == "Disconnected" and random.random() < 0.1:
             dev["status"] = "Connected"
             dev["signal_strength"] = random.randint(60, 100)
             
        if dev["status"] == "Connected":
            dev["last_sync"] = "Just now"
    return devices

def scan_nearby_devices(patient_id: str) -> list[dict[str, Any]]:
    return [
        {"id": f"SCAN_{random.randint(1000, 9999)}", "name": "Apple Watch Series 9", "type": "Smartwatch", "protocol": "Bluetooth LE", "signal": 92},
        {"id": f"SCAN_{random.randint(1000, 9999)}", "name": "Dexcom G7", "type": "CGM", "protocol": "Bluetooth LE", "signal": 85},
        {"id": f"SCAN_{random.randint(1000, 9999)}", "name": "ICU Philips Monitor", "type": "Hospital Gateway", "protocol": "Wi-Fi Direct", "signal": 98},
        {"id": f"SCAN_{random.randint(1000, 9999)}", "name": "Oura Ring Gen3", "type": "Smart Ring", "protocol": "Bluetooth LE", "signal": 76},
        {"id": f"SCAN_{random.randint(1000, 9999)}", "name": "Omron BP7450", "type": "Blood Pressure", "protocol": "Bluetooth Classic", "signal": 88}
    ]

def get_health_alerts(patient_id: str) -> list[dict[str, Any]]:
    return HEALTH_ALERTS_DB.get(patient_id, [])
