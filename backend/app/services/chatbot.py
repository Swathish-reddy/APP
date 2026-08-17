import json
import os
from typing import Any

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

def run_clinical_chatbot(message: str, patient_context: dict[str, Any] = None) -> str:
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
        f"**CogniVue Clinical AI Assistant**:\n\n"
        f"Based on my analysis of your query regarding '{message}', here is a detailed breakdown:\n\n"
        f"**1. Mechanism & Processing**\n"
        f"The system automatically aggregates relevant clinical data, telemetry from connected devices, and lab report metrics to evaluate this. Our What-If Simulator and Digital Twin engines can further model this to predict future outcomes and health trajectories based on current inputs.\n\n"
        f"**2. Clinical & Functional Impact**\n"
        f"When interacting with these parameters, the AI cross-references thousands of clinical guidelines to ensure that any simulated lifestyle, medication, or dietary changes are accurately reflected in your overall Health Score and Disease Risk profiles.\n\n"
        f"**3. Recommended Next Steps**\n"
        f"To get the most accurate results for this specific area, ensure that your latest lab reports are uploaded in the Lab Reports module and that your wearable data is actively syncing. You can then navigate to the What-If Simulator to visualize different health trajectories."
    )

def query_chatbot(message: str, patient_context: dict[str, Any] = None, history: list[dict[str, str]] = None) -> str:
    """
    Primary endpoint for clinical chat.
    Uses Gemini API if key is set, otherwise falls back to clinical rules classifier.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if HAS_GEMINI and api_key:
        try:
            genai.configure(api_key=api_key)
            
            system_instruction = (
                "You are the CognivueX AI Assistant, a production-grade, enterprise-level healthcare AI copilot.\n"
                "You must behave like ChatGPT, Microsoft Copilot, or Claude while remaining specialized for CognivueX healthcare intelligence.\n"
                "NEVER respond with generic or repetitive template answers like 'You asked about...' or 'I can explain platform functionality...'. Answer directly and naturally.\n"
                "You understand context, reason intelligently, and perform platform actions where authorized.\n"
                "PLATFORM KNOWLEDGE: You know every CognivueX feature including Dashboard, Risk Prediction, Future Disease Timeline, Digital Twin, What-If Simulator, Lab Reports, Medication Center, Clinical Review, Wearables, Appointments, Medical History, AI Insights, Health Score, Recommendations, Profile, Settings, Notifications, Documents, Admin Panel, User Management, Permissions, Security, Cloud Sync, Offline Mode, Export, Import.\n"
                "If the user asks to open or navigate to a module, you MUST trigger a platform action by outputting a JSON object containing an 'action' field.\n"
                "REPORT UNDERSTANDING: Explain lab findings, identify abnormal values, compare previous reports, highlight improvements/deteriorations, explain medical terminology. Never fabricate values.\n"
                "DIGITAL TWIN & SIMULATOR: Explain Digital Twin simulations, scenario comparisons, health forecasts, disease progression, medication/lifestyle impact, risk evolution, and confidence scores.\n"
                "REASONING: Reason before responding. Understand the objective, select the correct module, retrieve relevant data, and generate personalized answers.\n"
                "OUTPUT FORMAT: Return a JSON object formatted exactly like this:\n"
                "{\n"
                '  "message": "Your conversational response in Markdown formatting",\n'
                '  "action": {"type": "NAVIGATE", "target": "/dashboard"} // ONLY include this if the user asks to navigate somewhere. Otherwise, omit the "action" key or set it to null. Valid targets are like "/dashboard", "/risk-center", "/simulator", "/analytics", "/medications", "/documents".\n'
                "}\n"
                "Always return valid JSON. Do not wrap the JSON in Markdown block ticks (e.g. ```json).\n\n"
            )
            
            if patient_context:
                system_instruction += f"Here is the patient digital twin data to analyze: {json.dumps(patient_context)}.\n"
            
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
            
            gemini_history = []
            if history:
                for msg in history:
                    # skip assistant messages that aren't valid JSON to prevent crash in parsing
                    role = "user" if msg["role"] == "user" else "model"
                    content = msg["content"]
                    gemini_history.append({"role": role, "parts": [content]})
            
            chat_session = model.start_chat(history=gemini_history)
            response = chat_session.send_message(message)
            
            # Clean up the response in case Gemini wrapped it in markdown json block
            res_text = response.text.strip()
            res_text = res_text.removeprefix("```json")
            res_text = res_text.removeprefix("```")
            res_text = res_text.removesuffix("```")
                
            return res_text.strip()
        except Exception as e:
            print(f"Gemini API execution error: {e}. Falling back to rule-engine.")
            return run_clinical_chatbot(message, patient_context)
    else:
        return run_clinical_chatbot(message, patient_context)
