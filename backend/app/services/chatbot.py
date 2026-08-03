import os
from typing import Dict, Any, List
import json

# Try to import google-generativeai
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# Clinical Fallback Engine for rule-based matching
CLINICAL_DATABASE = {
    "symptoms": {
        "keywords": ["chest pain", "shortness of breath", "cough", "fatigue", "dizzy", "headache", "wheez", "pain", "swelling"],
        "advice": "WARNING: If you are experiencing chest tightness, sudden numbness, severe breathing difficulty, or speech issues, please seek emergency medical services (911) immediately. For mild symptoms, monitor vitals closely and consult your primary care doctor."
    },
    "medications": {
        "keywords": ["metformin", "lisinopril", "atorvastatin", "albuterol", "side effects", "dosage", "drug", "pill", "interaction"],
        "advice": "Medication Guidance:\n- Metformin: Primarily used for glycemic control. Take with meals to reduce digestive side effects.\n- Lisinopril: ACE inhibitor for blood pressure. Watch for dry cough or dizziness. Avoid high-potassium supplements.\n- Atorvastatin: Cholesterol-lowering statin. Monitor for unexplained muscle aches and obtain baseline liver panel checks.\n- Albuterol: Fast-acting bronchodilator. Can cause transient tremors or elevated heart rate."
    },
    "reports": {
        "keywords": ["hba1c", "egfr", "creatinine", "cholesterol", "ldl", "labs", "report", "blood test"],
        "advice": "Report Interpretation Basics:\n- HbA1c: Normal is < 5.7%, Pre-diabetic is 5.7%-6.4%, Diabetic is >= 6.5%.\n- eGFR: Normal filtration rate is > 90. Values < 60 suggest chronic kidney filtration reduction.\n- LDL Cholesterol: 'Bad' cholesterol. Ideally < 100 mg/dL (< 70 mg/dL if high risk).\n- Creatinine: Normal is roughly 0.5-1.2 mg/dL. Elevated levels indicate reduced kidney clearance."
    },
    "diet": {
        "keywords": ["diet", "meal", "food", "recipe", "eat", "calories", "sugar", "salt", "sodium"],
        "advice": "Dietary Principles:\n- For Diabetes: Focus on high-fiber complex carbohydrates, lean protein, and portion control to stabilize glucose.\n- For Hypertension (Cardiac): Follow the DASH diet, reducing sodium (< 1500mg/day) and increasing potassium-rich foods (if renal function permits).\n- For Renal Disease (CKD): Severely limit sodium, phosphorus, and potassium. Reduce overall protein load to ease glomerular stress."
    }
}

def clean_response(text: str) -> str:
    """Helper to ensure response formats cleanly."""
    return text.strip()

def run_clinical_chatbot(message: str, patient_context: Dict[str, Any] = None) -> str:
    """Clinical rule-based keyword match chatbot."""
    msg_lower = message.lower()
    
    # 1. Check for specific patient-aware greeting
    if patient_context and any(kw in msg_lower for kw in ["my twin", "my profile", "my case", "about me", "my health"]):
        p_name = patient_context.get("name", "Patient")
        p_age = patient_context.get("age", 0)
        p_history = ", ".join(patient_context.get("medical_history", ["None"]))
        p_bp = patient_context["vitals"].get("systolic_bp", 120)
        p_hba1c = patient_context["labs"].get("hba1c", 5.4)
        
        return (
            f"Hello. Analyzing the digital twin profile for **{p_name}** ({p_age}y/o):\n\n"
            f"- **Active Conditions**: {p_history}\n"
            f"- **Latest Blood Pressure**: {p_bp} mmHg\n"
            f"- **Latest HbA1c**: {p_hba1c}%\n\n"
            f"Based on this digital twin telemetry, we recommend monitoring cardiovascular risk factors, maintaining a balanced dietary structure, and scheduling follow-up lab reviews. What specific parameters would you like me to analyze?"
        )
        
    # 2. Key category search
    response_blocks = []
    
    for category, details in CLINICAL_DATABASE.items():
        if any(kw in msg_lower for kw in details["keywords"]):
            response_blocks.append(details["advice"])
            
    if response_blocks:
        merged_advice = "\n\n---\n\n".join(response_blocks)
        return (
            "**CogniVue Clinical AI Assistant** (Rule-Based Fallback):\n\n"
            f"{merged_advice}\n\n"
            "*Disclaimer: This AI response is a decision support projection based on clinical rules. Please review all details with a qualified healthcare professional before making therapeutic modifications.*"
        )
        
    return (
        "**CogniVue Clinical AI Assistant**:\n\n"
        "I can help you analyze symptoms, explain lab reports, summarize medical conditions, check drug interactions, and plan nutritional intakes.\n\n"
        "Try asking me details like:\n"
        "- *'Explain what my eGFR and HbA1c mean'* \n"
        "- *'What are the side effects of Metformin?'*\n"
        "- *'Analyze my chest pain symptom'*\n"
        "- *'Tell me about my profile twin status'*"
    )

def query_chatbot(message: str, patient_context: Dict[str, Any] = None) -> str:
    """
    Primary endpoint for clinical chat.
    Uses Gemini API if key is set, otherwise falls back to clinical rules classifier.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if HAS_GEMINI and api_key:
        try:
            genai.configure(api_key=api_key)
            # Use gemini-1.5-flash or gemini-pro
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Format custom context instructions
            context_prompt = ""
            if patient_context:
                context_prompt = (
                    f"You are CogniVueX AI Digital Twin Engine, an enterprise-grade medical artificial intelligence system "
                    f"responsible for creating, maintaining, and continuously updating a personalized digital twin of every patient.\n"
                    f"Your role is NOT to simply display medical reports.\n"
                    f"Your primary objective is to build a living computational model of a patient's physiology, diseases, "
                    f"laboratory values, medications, lifestyle, genetics, wearable data, imaging findings, environmental factors, "
                    f"and historical medical records.\n\n"
                    f"The Digital Twin must behave exactly like the patient's virtual body. Every new piece of data should update the twin.\n"
                    f"The Digital Twin must continuously simulate disease progression, treatment outcomes, organ interactions, and future health states.\n"
                    f"Never fabricate medical values. Whenever data is unavailable clearly state: 'Insufficient data available.' instead of guessing.\n\n"
                    f"SYSTEM GOALS:\n"
                    f"Create a complete virtual patient, update continuously, simulate physiological responses, predict future diseases, "
                    f"estimate treatment outcomes, explain every recommendation, show confidence scores, detect anomalies, "
                    f"estimate biological age, estimate life expectancy, predict hospitalization/mortality risks, predict organ deterioration, "
                    f"predict medication effectiveness, compare treatments, and support clinicians.\n\n"
                    f"OUTPUT FORMAT:\n"
                    f"Always structure output into:\n"
                    f"1. Digital Twin Summary\n2. Overall Health Score\n3. Organ Health\n4. Disease Risk Radar\n"
                    f"5. Biological Age\n6. Life Expectancy\n7. Current Alerts\n8. Predicted Diseases\n9. AI Recommendations\n"
                    f"10. What-If Simulations\n11. Medication Analysis\n12. Lifestyle Analysis\n13. Explainable AI\n"
                    f"14. Confidence Scores\n15. Future Timeline\n16. Suggested Next Tests\n17. Export Ready Data\n\n"
                    f"SYSTEM BEHAVIOR:\n"
                    f"Always behave like an AI physician assistant. Never diagnose with certainty. Always provide probabilities. "
                    f"Never invent laboratory values. Never replace licensed medical advice. Explain all predictions clearly. "
                    f"Prioritize patient safety. Keep outputs professional, concise, and clinically interpretable.\n\n"
                    f"Here is the patient digital twin data to analyze: {json.dumps(patient_context)}.\n\n"
                )
                
            full_prompt = f"{context_prompt}User Patient Query: {message}"
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            # Fallback to local rule engine if API call fails
            print(f"Gemini API execution error: {e}. Falling back to rule-engine.")
            return run_clinical_chatbot(message, patient_context)
    else:
        return run_clinical_chatbot(message, patient_context)
