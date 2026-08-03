from typing import Dict, List, Any
import copy

# Mock Patients Data
INITIAL_PATIENTS: Dict[str, Dict[str, Any]] = {
    "P101": {
        "id": "P101",
        "name": "Sarah Jenkins",
        "age": 58,
        "gender": "Female",
        "weight_kg": 88.5,
        "height_cm": 162.0,
        "bmi": 33.7, # Obese
        "blood_group": "O-positive",
        "location": "Boston, MA",
        "contact": "+1 (555) 234-5678",
        
        # Physiological Layer (Vitals & Labs)
        "vitals": {
            "heart_rate": 82,
            "systolic_bp": 145, # Stage 2 Hypertension
            "diastolic_bp": 92,
            "spo2": 96,
            "glucose": 142, # Elevated
            "temperature": 36.8,
            "respiratory_rate": 18
        },
        "labs": {
            "cholesterol_total": 245, # Elevated (>200)
            "cholesterol_ldl": 162, # High (>130)
            "cholesterol_hdl": 39, # Low (<40)
            "hba1c": 6.8, # Diabetic (>6.5%)
            "creatinine": 1.2, # Slightly elevated (normal 0.5-1.1 for female)
            "egfr": 58, # Stage 3 CKD (<60)
            "ast": 32,
            "alt": 38,
            "fev1_percent": 82 # Lung function %
        },
        
        # Behavioral Layer (Lifestyle)
        "lifestyle": {
            "average_steps_day": 3400, # Sedentary
            "sleep_hours": 5.5, # Insufficient
            "sleep_quality_percent": 60,
            "stress_level_scale_10": 8, # High stress
            "smoking_status": "Current Smoker", # 1 pack/day
            "diet_type": "High Sodium, Processed Foods",
            "alcohol_intake": "Moderate"
        },
        
        # Clinical Layer
        "medical_history": ["Type 2 Diabetes", "Hypertension", "Chronic Kidney Disease Stage 3"],
        "active_medications": [
            {"name": "Metformin", "dosage": "1000mg", "schedule": "Twice daily with meals"},
            {"name": "Lisinopril", "dosage": "20mg", "schedule": "Once daily in the morning"}
        ],
        "allergies": ["Penicillin", "Sulfa drugs"],
        
        # Symptoms
        "symptoms": ["Mild shortness of breath on exertion", "Frequent urination", "Fatigue"],
        
        # Organ health status (1-100 score, where 100 is optimal)
        "organ_health": {
            "heart": 62,
            "kidney": 58,
            "liver": 75,
            "lung": 70,
            "brain": 80
        }
    },
    "P102": {
        "id": "P102",
        "name": "Marcus Vance",
        "age": 42,
        "gender": "Male",
        "weight_kg": 72.0,
        "height_cm": 178.0,
        "bmi": 22.7, # Normal Weight
        "blood_group": "A-positive",
        "location": "San Francisco, CA",
        "contact": "+1 (555) 876-5432",
        
        # Physiological Layer
        "vitals": {
            "heart_rate": 62,
            "systolic_bp": 118, # Normal
            "diastolic_bp": 76,
            "spo2": 99,
            "glucose": 90, # Normal
            "temperature": 36.6,
            "respiratory_rate": 14
        },
        "labs": {
            "cholesterol_total": 170,
            "cholesterol_ldl": 95,
            "cholesterol_hdl": 55,
            "hba1c": 5.1, # Normal
            "creatinine": 0.9, # Normal
            "egfr": 95, # Normal (>90)
            "ast": 22,
            "alt": 24,
            "fev1_percent": 96
        },
        
        # Behavioral Layer
        "lifestyle": {
            "average_steps_day": 10500, # Highly active
            "sleep_hours": 7.8, # Good sleep
            "sleep_quality_percent": 88,
            "stress_level_scale_10": 3, # Low stress
            "smoking_status": "Never Smoked",
            "diet_type": "Mediterranean, Low Carb",
            "alcohol_intake": "Occasional"
        },
        
        # Clinical Layer
        "medical_history": [],
        "active_medications": [],
        "allergies": ["Peanuts"],
        
        # Symptoms
        "symptoms": [],
        
        "organ_health": {
            "heart": 95,
            "kidney": 94,
            "liver": 92,
            "lung": 95,
            "brain": 94
        }
    },
    "P103": {
        "id": "P103",
        "name": "Evelyn Chen",
        "age": 67,
        "gender": "Female",
        "weight_kg": 64.0,
        "height_cm": 158.0,
        "bmi": 25.6, # Slightly overweight
        "blood_group": "AB-positive",
        "location": "Seattle, WA",
        "contact": "+1 (555) 432-1098",
        
        # Physiological Layer
        "vitals": {
            "heart_rate": 78,
            "systolic_bp": 136, # Prehypertension / Stage 1
            "diastolic_bp": 84,
            "spo2": 93, # Slightly low oxygen (Asthma/COPD indicator)
            "glucose": 115, # Pre-diabetes range
            "temperature": 37.1,
            "respiratory_rate": 20
        },
        "labs": {
            "cholesterol_total": 210,
            "cholesterol_ldl": 128,
            "cholesterol_hdl": 46,
            "hba1c": 5.9, # Pre-diabetic
            "creatinine": 1.1,
            "egfr": 72, # Mild decrease
            "ast": 48, # Slightly elevated liver enzymes
            "alt": 55, # Slightly elevated liver enzymes (Fatty Liver risk)
            "fev1_percent": 65 # Decreased lung function
        },
        
        # Behavioral Layer
        "lifestyle": {
            "average_steps_day": 4800,
            "sleep_hours": 6.2,
            "sleep_quality_percent": 68,
            "stress_level_scale_10": 5,
            "smoking_status": "Former Smoker",
            "diet_type": "Balanced but High Sugar",
            "alcohol_intake": "Occasional"
        },
        
        # Clinical Layer
        "medical_history": ["Asthma", "Mild Fatty Liver", "Osteoarthritis"],
        "active_medications": [
            {"name": "Albuterol Inhaler", "dosage": "90mcg", "schedule": "2 puffs as needed for wheezing"},
            {"name": "Atorvastatin", "dosage": "10mg", "schedule": "Once daily at bedtime"}
        ],
        "allergies": ["Aspirin"],
        
        # Symptoms
        "symptoms": ["Wheezing", "Joint pain in knees"],
        
        "organ_health": {
            "heart": 74,
            "kidney": 72,
            "liver": 66,
            "lung": 58,
            "brain": 76
        }
    }
}

# In-memory patient store mutable during simulation
patients_db = copy.deepcopy(INITIAL_PATIENTS)


# Doctors Directory
DOCTORS_DB: List[Dict[str, Any]] = [
    {
        "id": "D1",
        "name": "Dr. Aris Vance",
        "specialization": "Cardiologist",
        "experience_years": 16,
        "qualification": "MD, FACC - Harvard Medical School",
        "rating": 4.9,
        "consultation_fee": 250,
        "availability": "Mon, Wed, Fri (9:00 AM - 3:00 PM)",
        "location": "Boston, MA",
        "telemedicine_support": True,
        "response_time": "Under 2 hours",
        "research_activity": "High",
        "reviews": [
            {"user": "Alice S.", "rating": 5, "comment": "Saved my life, diagnosed my arterial blockage early!"},
            {"user": "John D.", "rating": 4.8, "comment": "Very thorough, explains everything very clearly."}
        ]
    },
    {
        "id": "D2",
        "name": "Dr. Sarah Patel",
        "specialization": "Endocrinologist (Diabetes Specialist)",
        "experience_years": 12,
        "qualification": "MD - Johns Hopkins University",
        "rating": 4.8,
        "consultation_fee": 200,
        "availability": "Tue, Thu (10:00 AM - 5:00 PM)",
        "location": "Boston, MA",
        "telemedicine_support": True,
        "response_time": "Under 4 hours",
        "research_activity": "Moderate",
        "reviews": [
            {"user": "Robert M.", "rating": 5, "comment": "Finally got my HbA1c below 6.5 under her guidance."},
            {"user": "Emily K.", "rating": 4.6, "comment": "Excellent clinic layout and friendly consultation."}
        ]
    },
    {
        "id": "D3",
        "name": "Dr. Elizabeth Warren",
        "specialization": "Pulmonologist",
        "experience_years": 20,
        "qualification": "MD, FCCP - Stanford Medicine",
        "rating": 4.7,
        "consultation_fee": 220,
        "availability": "Mon, Tue, Thu (8:00 AM - 12:00 PM)",
        "location": "Seattle, WA",
        "telemedicine_support": False,
        "response_time": "1 Business Day",
        "research_activity": "Low",
        "reviews": [
            {"user": "Kevin G.", "rating": 5, "comment": "Incredible asthma management. Highly recommended."},
            {"user": "Maria F.", "rating": 4.4, "comment": "Knows her stuff but has a slightly busy waiting room."}
        ]
    },
    {
        "id": "D4",
        "name": "Dr. James Cole",
        "specialization": "Nephrologist (Kidney Specialist)",
        "experience_years": 15,
        "qualification": "MD - Columbia Physicians & Surgeons",
        "rating": 4.9,
        "consultation_fee": 240,
        "availability": "Wed, Fri (1:00 PM - 5:00 PM)",
        "location": "San Francisco, CA",
        "telemedicine_support": True,
        "response_time": "Under 2 hours",
        "research_activity": "High",
        "reviews": [
            {"user": "Greg Y.", "rating": 5, "comment": "Very detailed explanation of my chronic kidney disease management."},
            {"user": "Lisa T.", "rating": 4.8, "comment": "Insightful and reassuring doctor."}
        ]
    },
    {
        "id": "D5",
        "name": "Dr. Henry Lim",
        "specialization": "Gastroenterologist (Liver/Digestive Specialist)",
        "experience_years": 14,
        "qualification": "MD - Yale School of Medicine",
        "rating": 4.6,
        "consultation_fee": 190,
        "availability": "Tue, Wed (9:30 AM - 4:00 PM)",
        "location": "Boston, MA",
        "telemedicine_support": True,
        "response_time": "Under 4 hours",
        "research_activity": "Moderate",
        "reviews": [
            {"user": "Sandra W.", "rating": 4.8, "comment": "Great advice on reversing fatty liver disease through diet."}
        ]
    }
]


# Hospitals Directory
HOSPITALS_DB: List[Dict[str, Any]] = [
    {
        "id": "H1",
        "name": "Massachusetts General Hospital (MGH)",
        "specialty": "Cardiology, Nephrology, Neurology",
        "infrastructure": "Level 1 Trauma Center, 24/7 Stroke Unit, Cardiac Cath Lab",
        "icu_availability": 8, # Available ICU beds
        "success_rate": 96.5,
        "rating": 4.9,
        "distance_miles": 2.4, # Calculated relative to patient's mock position
        "cost_estimate": "$$$$",
        "ranking_score": 98.2,
        "emergency_readiness": "Level 1 Trauma Center, 24/7",
        "patient_outcomes": "Top 1% Nationally",
        "accreditations": ["JCI", "Magnet Recognized"]
    },
    {
        "id": "H2",
        "name": "Boston Medical Center",
        "specialty": "Emergency Care, Pulmonology, Endocrinology",
        "infrastructure": "Emergency Resuscitation Unit, Diabetes Care Center",
        "icu_availability": 14,
        "success_rate": 91.2,
        "rating": 4.5,
        "distance_miles": 4.1,
        "cost_estimate": "$$",
        "ranking_score": 89.5,
        "emergency_readiness": "Level 2 Trauma Center",
        "patient_outcomes": "Above Average",
        "accreditations": ["JCAHO"]
    },
    {
        "id": "H3",
        "name": "UCSF Medical Center",
        "specialty": "Kidney Transplant, Neurology, Cardiology",
        "infrastructure": "Advanced Digital Patient Monitoring, Specialized ICU",
        "icu_availability": 5,
        "success_rate": 97.2,
        "rating": 4.8,
        "distance_miles": 3.8,
        "cost_estimate": "$$$$",
        "ranking_score": 96.8,
        "emergency_readiness": "Level 1 Trauma Center",
        "patient_outcomes": "Top 5% Nationally",
        "accreditations": ["JCI", "AHA Certified"]
    },
    {
        "id": "H4",
        "name": "Seattle Swedish Medical Center",
        "specialty": "Asthma and Allergy, Orthopedics, Cardiology",
        "infrastructure": "Hyperbaric Oxygen Chambers, Pulmonology Lab",
        "icu_availability": 11,
        "success_rate": 93.8,
        "rating": 4.7,
        "distance_miles": 1.9,
        "cost_estimate": "$$$",
        "ranking_score": 92.4,
        "emergency_readiness": "Standard ER",
        "patient_outcomes": "Excellent",
        "accreditations": ["JCAHO"]
    }
]


# Drug Interaction & Side Effects Database
DRUG_INTERACTIONS = {
    ("Metformin", "Contrast Dye"): {
        "severity": "High",
        "interaction": "Increased risk of lactic acidosis. Suspend metformin 48 hours prior to contrast imaging.",
        "side_effects": ["Lactic acidosis", "Kidney injury"]
    },
    ("Lisinopril", "Aspirin"): {
        "severity": "Moderate",
        "interaction": "May decrease the antihypertensive effect of Lisinopril and increase renal risk, especially in dehydrated patients.",
        "side_effects": ["Elevated blood pressure", "Decreased renal function"]
    },
    ("Lisinopril", "Potassium Supplements"): {
        "severity": "High",
        "interaction": "Concomitant use may result in severe hyperkalemia (high potassium). Monitor serum potassium.",
        "side_effects": ["Hyperkalemia", "Cardiac arrhythmia"]
    },
    ("Atorvastatin", "Gemfibrozil"): {
        "severity": "High",
        "interaction": "Increases concentration of Atorvastatin, significantly boosting risk of myopathy (muscle pain) and rhabdomyolysis.",
        "side_effects": ["Severe muscle breakdown", "Kidney damage"]
    },
    ("Albuterol", "Beta-Blockers"): {
        "severity": "High",
        "interaction": "Beta-blockers can cause severe bronchospasm in asthma patients and antagonize the rescue effect of Albuterol.",
        "side_effects": ["Severe bronchospasm", "Shortness of breath"]
    }
}

KNOWN_SIDE_EFFECTS = {
    "Metformin": ["Nausea", "Diarrhea", "Abdominal discomfort", "Metallic taste", "Vitamin B12 deficiency"],
    "Lisinopril": ["Dry cough", "Dizziness", "Headache", "Hyperkalemia", "Orthostatic hypotension"],
    "Atorvastatin": ["Muscle aches (myalgia)", "Elevated liver enzymes", "Nausea", "Headache"],
    "Albuterol": ["Tremors", "Tachycardia (fast heart rate)", "Nervousness", "Palpitations", "Hypokalemia"]
}

def get_drug_interactions(drugs: List[str]) -> List[Dict[str, Any]]:
    """Checks for interactions in a list of drugs."""
    interactions = []
    for i in range(len(drugs)):
        for j in range(i + 1, len(drugs)):
            d1, d2 = drugs[i], drugs[j]
            # Try both orderings
            key = (d1, d2)
            if key not in DRUG_INTERACTIONS:
                key = (d2, d1)
            
            if key in DRUG_INTERACTIONS:
                details = DRUG_INTERACTIONS[key]
                interactions.append({
                    "drug_a": d1,
                    "drug_b": d2,
                    "severity": details["severity"],
                    "interaction": details["interaction"],
                    "side_effects": details["side_effects"]
                })
    return interactions


# --- CDSS Mock Tables ---

EVIDENCE_STORE = {
    "Diabetes": [
        {"guideline": "ADA 2024 Standards of Medical Care in Diabetes", "recommendation": "Maintain HbA1c < 7.0% for non-pregnant adults.", "level": "A"},
        {"guideline": "WHO Guidelines on Diabetes Management", "recommendation": "Lifestyle interventions (diet and exercise) as first-line therapy.", "level": "A"}
    ],
    "Cardiovascular": [
        {"guideline": "AHA/ACC Hypertension Guidelines", "recommendation": "Target blood pressure < 130/80 mmHg.", "level": "A"},
        {"guideline": "ESC Guidelines", "recommendation": "Statin therapy for LDL-C reduction in high-risk patients.", "level": "A"}
    ],
    "Kidney": [
        {"guideline": "KDIGO Clinical Practice Guideline", "recommendation": "Monitor eGFR and UACR annually in patients with CKD.", "level": "B"},
        {"guideline": "KDIGO CKD Management", "recommendation": "Use ACE inhibitors or ARBs for non-dialysis CKD with hypertension and albuminuria.", "level": "A"}
    ],
    "Respiratory": [
        {"guideline": "GINA Guidelines for Asthma", "recommendation": "Inhaled corticosteroids (ICS) are recommended for symptom control.", "level": "A"}
    ],
    "Preventive": [
        {"guideline": "CDC Physical Activity Guidelines", "recommendation": "At least 150 minutes of moderate-intensity aerobic activity per week.", "level": "A"},
        {"guideline": "WHO Sleep Guidelines", "recommendation": "7-9 hours of good quality sleep per night for adults.", "level": "B"}
    ]
}

TREATMENT_PATHWAYS_DB = {
    "Prediabetes": [
        {"step": 1, "action": "Lifestyle Modifications", "details": "Diet change, increase physical activity to 150 min/week.", "duration": "3 months"},
        {"step": 2, "action": "Monitor HbA1c", "details": "Re-test HbA1c to check for improvement.", "duration": "Immediate"},
        {"step": 3, "action": "Re-evaluation", "details": "If HbA1c > 6.4%, consider Metformin initiation. If improved, continue lifestyle.", "duration": "Ongoing"}
    ],
    "Hypertension Stage 1": [
        {"step": 1, "action": "DASH Diet & Sodium Reduction", "details": "Limit sodium to < 1500mg/day. Increase potassium.", "duration": "1 month"},
        {"step": 2, "action": "Blood Pressure Monitoring", "details": "Home BP monitoring daily.", "duration": "1 month"},
        {"step": 3, "action": "Pharmacotherapy Review", "details": "If BP remains > 130/80, initiate single anti-hypertensive agent.", "duration": "Ongoing"}
    ]
}

CARE_PLANS_DB = {} # To be populated dynamically per patient
RECOMMENDATIONS_DB = {} # To be populated dynamically per patient
FOLLOW_UPS_DB = {} # To be populated dynamically per patient

# --- Nutrition Intelligence Mock Tables ---

FOOD_DATABASE = {
    "Brown Rice": {"calories": 216, "protein": 5.0, "carbs": 44.8, "fat": 1.8, "gi": 50, "allergens": [], "category": "grains"},
    "White Rice": {"calories": 205, "protein": 4.3, "carbs": 44.5, "fat": 0.4, "gi": 73, "allergens": [], "category": "grains"},
    "Quinoa": {"calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6, "gi": 53, "allergens": [], "category": "grains"},
    "Chicken Breast": {"calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "gi": 0, "allergens": [], "category": "proteins"},
    "Tofu": {"calories": 144, "protein": 15.5, "carbs": 2.8, "fat": 8.7, "gi": 15, "allergens": ["soy"], "category": "proteins"},
    "Salmon": {"calories": 208, "protein": 20.4, "carbs": 0.0, "fat": 13.4, "gi": 0, "allergens": ["fish"], "category": "proteins"},
    "Broccoli": {"calories": 55, "protein": 3.7, "carbs": 11.2, "fat": 0.6, "gi": 15, "allergens": [], "category": "vegetables"},
    "Spinach": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "gi": 15, "allergens": [], "category": "vegetables"},
    "Almonds": {"calories": 579, "protein": 21.2, "carbs": 21.6, "fat": 49.9, "gi": 0, "allergens": ["nuts"], "category": "fats"},
    "Olive Oil": {"calories": 884, "protein": 0.0, "carbs": 0.0, "fat": 100.0, "gi": 0, "allergens": [], "category": "fats"}
}

RECIPES_DB = [
    {"id": "R1", "name": "Mediterranean Quinoa Bowl", "tags": ["Cardiac", "Low Sodium", "Vegetarian"], "macros": {"calories": 400, "protein": 15, "carbs": 45, "fat": 18}},
    {"id": "R2", "name": "Baked Salmon with Broccoli", "tags": ["Diabetes", "Keto", "High Protein"], "macros": {"calories": 350, "protein": 35, "carbs": 10, "fat": 20}},
    {"id": "R3", "name": "Low Potassium Chicken Salad", "tags": ["Kidney", "Renal"], "macros": {"calories": 300, "protein": 25, "carbs": 15, "fat": 12}}
]

NUTRITION_PLANS_DB = {} # To be populated dynamically per patient
GROCERY_LISTS_DB = {} # To be populated dynamically per patient
COMPLIANCE_RECORDS_DB = {} # To be populated dynamically per patient

# --- Care Navigator Intelligence Mock Tables ---

DIAGNOSTIC_CENTERS_DB = [
    {
        "id": "DC1",
        "name": "Quest Diagnostics Central",
        "services": ["Pathology", "Blood Panels", "Urinalysis"],
        "location": "Boston, MA",
        "distance_miles": 1.2,
        "rating": 4.5,
        "turnaround_time": "24 hours"
    },
    {
        "id": "DC2",
        "name": "Boston Advanced Imaging",
        "services": ["MRI", "CT Scan", "X-Ray", "Ultrasound"],
        "location": "Boston, MA",
        "distance_miles": 3.5,
        "rating": 4.8,
        "turnaround_time": "48 hours"
    }
]

APPOINTMENTS_DB = {} # List of appointments per patient
REFERRALS_DB = {} # List of referrals per patient
PATIENT_JOURNEYS_DB = {} # Journey timelines per patient

# --- Live Health Command Center Mock Tables ---

CONNECTED_DEVICES_DB = {
    "P101": [
        {"id": "DEV1", "type": "Apple Watch Series 9", "battery": 82, "status": "Connected", "last_sync": "Just now"},
        {"id": "DEV2", "type": "Dexcom G7 CGM", "battery": 45, "status": "Connected", "last_sync": "2 mins ago"},
        {"id": "DEV3", "type": "Omron Smart BP Monitor", "battery": 90, "status": "Standby", "last_sync": "4 hours ago"}
    ],
    "P102": [
        {"id": "DEV4", "type": "Garmin Fenix 7", "battery": 65, "status": "Connected", "last_sync": "Just now"},
        {"id": "DEV5", "type": "Oura Ring Gen3", "battery": 22, "status": "Connected", "last_sync": "10 mins ago"}
    ]
}

LIVE_STREAMS_DB = {} # In-memory buffer for high frequency data (e.g. ECG arrays)
HEALTH_ALERTS_DB = {} # History of real-time alerts per patient

