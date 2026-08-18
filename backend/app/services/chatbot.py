import json
import os
from typing import Any

# Try to import openai
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

from app.services.clinical_risk_engine import generate_disease_risk_report
from app.services.whatif_simulator import run_comprehensive_simulation
from app.services.xai_engine import generate_full_explanation
from app.services.twin_engine import estimate_metrics
from app.services.lab_analysis_engine import generate_lab_report
from app.core.config import settings

# Define tool schemas
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_disease_risk",
            "description": "Get the clinical risk analysis for the patient, including cardiovascular and diabetes risk.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_explainable_ai",
            "description": "Get the explainable AI (SHAP) analysis showing which factors are contributing to the patient's risk scores.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_latest_lab_report",
            "description": "Analyze the patient's latest laboratory results and get a structured lab report.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_digital_twin",
            "description": "Get the patient's Digital Twin metrics and health trajectory information.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_what_if",
            "description": "Simulate a what-if scenario by changing health parameters (e.g., reducing blood pressure or BMI) to see the effect on risk.",
            "parameters": {
                "type": "object",
                "properties": {
                    "changes": {
                        "type": "object",
                        "description": "A dictionary of parameter changes, e.g., {'systolic_bp': 120, 'bmi': 25.0}"
                    }
                },
                "required": ["changes"]
            }
        }
    }
]

def query_chatbot(message: str, patient_context: dict[str, Any] = None, history: list[dict[str, str]] = None) -> str:
    """
    Primary endpoint for conversational AI chat with Agentic Tool Calling.
    """
    api_key = settings.OPENAI_API_KEY
    model_name = settings.OPENAI_MODEL
    
    if not api_key or api_key.startswith("dummy"):
        return json.dumps({
            "message": "AI service is not configured. Configure the server-side OPENAI_API_KEY environment variable."
        })

    if not HAS_OPENAI:
        return json.dumps({
            "message": "OpenAI library not installed. Please install it."
        })

    client = OpenAI(api_key=api_key)
    
    system_instruction = (
        "You are CognivueX AI Assistant, an intelligent conversational agent within the CognivueX Clinical Decision Support System.\n"
        "BEHAVIOR RULES:\n"
        "1. You have access to tools to fetch patient risk, lab reports, explainability (SHAP), digital twin, and what-if simulations.\n"
        "2. If the user asks about their risk, labs, or to simulate a scenario, USE THE TOOLS to fetch the data before answering. Do not guess.\n"
        "3. If no patient context is available, inform the user they must select a patient.\n"
        "4. NEVER invent patient data, lab results, or diagnoses. Clearly distinguish predictions from confirmed diagnoses.\n"
        "5. Explain clinical concepts clearly and use simple language unless technical detail is requested.\n"
        "6. Answer general educational questions normally.\n"
        "7. Maintain conversation context. Remember previous messages to resolve pronouns (e.g., 'explain that').\n\n"
        "OUTPUT FORMAT: Return a valid JSON object formatted exactly like this:\n"
        "{\n"
        '  "message": "Your conversational response in Markdown formatting",\n'
        '  "action": {"type": "NAVIGATE", "target": "/dashboard"} // ONLY include this if the user explicitly asks to navigate somewhere. Otherwise, omit the "action" key.\n'
        "}\n"
        "Always return valid JSON. Do not wrap the JSON in Markdown block ticks.\n"
    )
    
    if patient_context:
        limited_context = {
            "demographics": {
                "name": patient_context.get("name"),
                "age": patient_context.get("age"),
                "gender": patient_context.get("gender"),
            },
            "medical_history": patient_context.get("medical_history"),
            "medications": patient_context.get("medications"),
            "allergies": patient_context.get("allergies"),
            "vitals": patient_context.get("vitals", {}),
            "labs": patient_context.get("labs", {})
        }
        system_instruction += f"\nBASIC PATIENT CONTEXT: {json.dumps(limited_context)}\n(Use tools to fetch deeper analysis like Risk, Digital Twin, XAI, etc.)\n"
    else:
        system_instruction += "\nNo patient is currently selected. Tool calls will likely fail. Advise the user to select a patient if they ask for patient data.\n"
    
    messages = [{"role": "system", "content": system_instruction}]
    
    if history:
        for msg in history[-10:]:
            role = msg.get("role")
            content = msg.get("content")
            if role in ["user", "assistant"] and content:
                # If content is a json string with 'message', extract it for better context
                try:
                    parsed = json.loads(content)
                    if "message" in parsed:
                        content = parsed["message"]
                except Exception:
                    pass
                messages.append({"role": role, "content": content})
            
    messages.append({"role": "user", "content": message})
    
    try:
        # Step 1: Call the model with tools
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            tools=tools,
            temperature=0.7,
        )
        
        response_message = response.choices[0].message
        
        # Step 2: Check if model wanted to call tools
        if response_message.tool_calls:
            # We must pass the assistant message with tool_calls back to the model
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                
                tool_result = {"error": "Unknown function"}
                
                if not patient_context:
                    tool_result = {"error": "No patient selected. Cannot execute tool."}
                else:
                    try:
                        args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                        
                        if function_name == "get_disease_risk":
                            tool_result = generate_disease_risk_report(patient_context)
                        elif function_name == "get_explainable_ai":
                            tool_result = generate_full_explanation(patient_context)
                        elif function_name == "get_latest_lab_report":
                            tool_result = generate_lab_report(patient_context, patient_context.get("labs", {}))
                        elif function_name == "get_digital_twin":
                            tool_result = estimate_metrics(patient_context)
                        elif function_name == "simulate_what_if":
                            changes = args.get("changes", {})
                            tool_result = run_comprehensive_simulation(patient_context, changes)
                    except Exception as ex:
                        tool_result = {"error": str(ex)}
                
                # Append tool result
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_result, default=str)
                })
            
            # Step 3: Second call to model with tool results
            second_response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            res_text = second_response.choices[0].message.content.strip()
            return res_text
        else:
            # If no tools called, ensure it's JSON (sometimes model might ignore response_format if not forced on first call)
            # We enforce json on the first call too by extracting or re-asking.
            # But wait, we didn't use response_format on the first call to allow tool calling natively.
            # So we check if it looks like JSON, if not, we wrap it.
            res_text = response_message.content.strip()
            if not res_text.startswith("{"):
                res_text = json.dumps({"message": res_text})
            return res_text
            
    except Exception as e:
        print(f"OpenAI API execution error: {e}")
        return json.dumps({
            "message": "I'm having trouble connecting to the AI service right now. Please try again in a moment."
        })
