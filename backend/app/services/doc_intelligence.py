import os
import json
import re
from typing import Dict, Any

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# Reference ranges for basic abnormality detection
REFERENCE_RANGES = {
    "hba1c": {"min": 0, "max": 5.6, "unit": "%"},
    "glucose": {"min": 70, "max": 99, "unit": "mg/dL"},
    "cholesterol": {"min": 0, "max": 199, "unit": "mg/dL"},
    "ldl": {"min": 0, "max": 99, "unit": "mg/dL"},
    "hdl": {"min": 40, "max": 100, "unit": "mg/dL"},
    "hemoglobin": {"min": 13.0, "max": 17.0, "unit": "g/dL"},
    "white_blood_cells": {"min": 4.0, "max": 10.0, "unit": "10^3/uL"},
    "platelets": {"min": 150, "max": 400, "unit": "10^3/uL"}
}

def analyze_document_with_gemini(text: str) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or not HAS_GEMINI:
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze the following medical document text.
        Provide the output strictly as a JSON object with the following schema:
        {{
            "category": "Lab Reports" | "Radiology" | "Cardiology" | "Prescriptions" | "Clinical Notes" | "Other",
            "report_type": "CBC" | "HbA1c" | "Lipid Profile" | "MRI" | "ECG" | etc.,
            "structured_data": {{
                "lab_metric_key": numerical_value
            }},
            "abnormalities": {{
                "metric_name": "High" | "Low" | "Abnormal"
            }},
            "ai_summary": "A 2-3 sentence clinical summary of the findings."
        }}
        
        Document Text:
        {text}
        """
        response = model.generate_content(prompt)
        # Clean response to parse JSON
        json_str = response.text.strip().replace('```json', '').replace('```', '').strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"Gemini Doc Intelligence error: {e}")
        return None

def fallback_analyze_document(text: str) -> Dict[str, Any]:
    """Basic regex and string matching fallback."""
    text_lower = text.lower()
    
    # Classification
    category = "Other"
    report_type = "Medical Report"
    
    if "blood count" in text_lower or "cbc" in text_lower:
        category = "Lab Reports"
        report_type = "CBC"
    elif "mri" in text_lower or "x-ray" in text_lower or "ct scan" in text_lower:
        category = "Radiology"
        report_type = "Imaging"
    elif "ecg" in text_lower or "ekg" in text_lower or "holter" in text_lower:
        category = "Cardiology"
        report_type = "ECG"
        
    # Extraction
    structured_data = {}
    
    def extract_val(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        return float(match.group(1)) if match else None

    # Common metrics
    metrics_patterns = {
        "hba1c": r"hba1c.*?(\d+\.\d+)",
        "glucose": r"glucose.*?(\d+\.?\d*)",
        "cholesterol": r"cholesterol total.*?(\d+\.?\d*)",
        "ldl": r"ldl.*?(\d+\.?\d*)",
        "hdl": r"hdl.*?(\d+\.?\d*)",
        "hemoglobin": r"hemoglobin.*?(\d+\.\d+)",
        "white_blood_cells": r"white blood cells.*?(\d+\.\d+)",
        "platelets": r"platelets.*?(\d+\.?\d*)"
    }
    
    for key, pattern in metrics_patterns.items():
        val = extract_val(pattern)
        if val is not None:
            structured_data[key] = val
            
    # Abnormality Detection
    abnormalities = {}
    for key, val in structured_data.items():
        if key in REFERENCE_RANGES:
            r = REFERENCE_RANGES[key]
            if val < r["min"]:
                abnormalities[key] = "Low"
            elif val > r["max"]:
                abnormalities[key] = "High"
                
    # Summary
    ai_summary = "Document analyzed successfully."
    if abnormalities:
        abn_list = ", ".join(abnormalities.keys())
        ai_summary = f"The report indicates abnormal values for: {abn_list}. Further clinical correlation is advised."
    else:
        ai_summary = "All extracted metrics appear to be within normal reference ranges."
        
    return {
        "category": category,
        "report_type": report_type,
        "structured_data": structured_data,
        "abnormalities": abnormalities,
        "ai_summary": ai_summary
    }

def analyze_medical_document(text: str) -> Dict[str, Any]:
    analysis = analyze_document_with_gemini(text)
    if analysis:
        return analysis
    return fallback_analyze_document(text)
