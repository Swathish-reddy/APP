from typing import Dict, Any, List
import copy
from app.db.db import FOOD_DATABASE, RECIPES_DB, NUTRITION_PLANS_DB, GROCERY_LISTS_DB, COMPLIANCE_RECORDS_DB
from app.services.fusion import run_ai_fusion

def calculate_macros(patient: Dict[str, Any], program_type: str) -> Dict[str, Any]:
    """Calculates TDEE and macro splits based on the therapeutic program."""
    age = patient["age"]
    weight_kg = patient["weight_kg"]
    height_cm = patient["height_cm"]
    gender = patient["gender"]
    
    if gender == "Female":
        bmr = 655.1 + (9.563 * weight_kg) + (1.850 * height_cm) - (4.676 * age)
    else:
        bmr = 66.47 + (13.75 * weight_kg) + (5.003 * height_cm) - (6.755 * age)
        
    steps = patient["lifestyle"].get("average_steps_day", 5000)
    if steps < 5000:
        multiplier = 1.2
    elif steps < 10000:
        multiplier = 1.55
    else:
        multiplier = 1.9
        
    tdee = int(bmr * multiplier)
    
    macros = {}
    if program_type == "Weight Management":
        target_cals = tdee - 500
        macros = {"carbs": 30, "protein": 40, "fat": 30}
    elif program_type == "Diabetes Nutrition":
        target_cals = tdee - 200
        macros = {"carbs": 35, "protein": 35, "fat": 30}
    elif program_type == "Cardiac Nutrition":
        target_cals = tdee
        macros = {"carbs": 45, "protein": 25, "fat": 30}
    elif program_type == "Kidney Nutrition":
        target_cals = tdee
        macros = {"carbs": 50, "protein": 15, "fat": 35}
    else:
        target_cals = tdee
        macros = {"carbs": 40, "protein": 30, "fat": 30}
        
    # Convert % to grams
    carb_g = int((target_cals * (macros["carbs"] / 100)) / 4)
    protein_g = int((target_cals * (macros["protein"] / 100)) / 4)
    fat_g = int((target_cals * (macros["fat"] / 100)) / 9)
    
    return {
        "tdee": tdee,
        "target_calories": max(1200, target_cals),
        "macros_percent": macros,
        "macros_grams": {"carbs": carb_g, "protein": protein_g, "fat": fat_g},
        "hydration_liters": round(weight_kg * 0.033, 1)
    }

def get_therapeutic_program(patient: Dict[str, Any], predictions: Dict[str, Any]) -> str:
    med_history = "".join(patient["medical_history"]).lower()
    
    if "kidney" in med_history or predictions.get("Kidney", {}).get("risk_percent", 0) > 50:
        return "Kidney Nutrition"
    if "diabetes" in med_history or predictions.get("Diabetes", {}).get("risk_percent", 0) > 50:
        return "Diabetes Nutrition"
    if "hypertension" in med_history or "cardiovascular" in med_history or predictions.get("Cardiovascular", {}).get("risk_percent", 0) > 50:
        return "Cardiac Nutrition"
    if patient["bmi"] > 28:
        return "Weight Management"
        
    return "General Healthy Nutrition"

def filter_allergens(foods: Dict[str, Any], allergies: List[str]) -> Dict[str, Any]:
    safe_foods = {}
    allergies_lower = [a.lower() for a in allergies]
    for name, data in foods.items():
        food_allergens = [a.lower() for a in data["allergens"]]
        # if no overlap
        if not set(allergies_lower).intersection(set(food_allergens)):
            safe_foods[name] = data
    return safe_foods

def generate_nutrition_plan(patient: Dict[str, Any]) -> Dict[str, Any]:
    ai_fusion = run_ai_fusion(patient)
    predictions = ai_fusion.get("predictions", {})
    
    program = get_therapeutic_program(patient, predictions)
    macro_calc = calculate_macros(patient, program)
    
    safe_foods = filter_allergens(FOOD_DATABASE, patient["allergies"])
    
    # Generate mock daily plan based on safe foods
    # In a real engine, we'd solve a knapsack/optimization problem to match macros.
    proteins = [k for k,v in safe_foods.items() if v["category"] == "proteins"]
    carbs = [k for k,v in safe_foods.items() if v["category"] == "grains"]
    veggies = [k for k,v in safe_foods.items() if v["category"] == "vegetables"]
    fats = [k for k,v in safe_foods.items() if v["category"] == "fats"]
    
    daily_plan = {
        "breakfast": {
            "name": f"Oatmeal with {fats[0] if fats else 'Berries'}",
            "calories": 350,
            "protein": 12,
            "carbs": 45,
            "fat": 15
        },
        "lunch": {
            "name": f"Grilled {proteins[0] if proteins else 'Tofu'} with {carbs[0] if carbs else 'Rice'} and {veggies[0] if veggies else 'Salad'}",
            "calories": 450,
            "protein": 35,
            "carbs": 40,
            "fat": 15
        },
        "dinner": {
            "name": f"Baked {proteins[1] if len(proteins)>1 else proteins[0] if proteins else 'Beans'} with {veggies[1] if len(veggies)>1 else veggies[0] if veggies else 'Veggies'}",
            "calories": 400,
            "protein": 30,
            "carbs": 30,
            "fat": 18
        },
        "snacks": {
            "name": f"Handful of {fats[0] if fats else 'Nuts'}",
            "calories": 200,
            "protein": 6,
            "carbs": 10,
            "fat": 15
        }
    }
    
    # Nutrition Impact estimation (XAI)
    impact = {
        "expected_weight_change_kg": -2.0 if program == "Weight Management" else -0.5,
        "hba1c_reduction": 0.5 if program == "Diabetes Nutrition" else 0.1,
        "bp_reduction_systolic": 8 if program == "Cardiac Nutrition" else 2,
        "reasoning": f"Plan prioritized {program} guidelines to manage high-risk indicators identified by AI Fusion."
    }
    
    plan = {
        "program": program,
        "goals": macro_calc,
        "daily_plan": daily_plan,
        "impact": impact,
        "score": 85
    }
    
    NUTRITION_PLANS_DB[patient["id"]] = plan
    return plan

def get_substitutions(food_name: str) -> List[Dict[str, Any]]:
    if food_name not in FOOD_DATABASE:
        return []
        
    target = FOOD_DATABASE[food_name]
    subs = []
    for name, data in FOOD_DATABASE.items():
        if name != food_name and data["category"] == target["category"]:
            # Basic matching logic
            subs.append({"name": name, "macros": data})
            
    return subs

def generate_grocery_list(patient_id: str) -> Dict[str, Any]:
    if patient_id not in NUTRITION_PLANS_DB:
        return {"items": [], "estimated_cost": "$0.00"}
        
    plan = NUTRITION_PLANS_DB[patient_id]
    
    # Mock aggregation
    items = []
    if "Tofu" in plan["daily_plan"]["lunch"]["name"]:
        items.append({"name": "Firm Tofu", "amount": "2 blocks", "category": "Proteins"})
    else:
        items.append({"name": "Chicken Breast", "amount": "1 kg", "category": "Proteins"})
        
    items.extend([
        {"name": "Brown Rice", "amount": "1 kg", "category": "Grains"},
        {"name": "Broccoli", "amount": "2 heads", "category": "Vegetables"},
        {"name": "Spinach", "amount": "2 bunches", "category": "Vegetables"},
        {"name": "Olive Oil", "amount": "1 bottle", "category": "Pantry"}
    ])
    
    grocery_list = {
        "items": items,
        "estimated_cost": "$45.00"
    }
    GROCERY_LISTS_DB[patient_id] = grocery_list
    return grocery_list

def track_compliance(patient_id: str, adherence_percent: int):
    # Log daily adherence
    if patient_id not in COMPLIANCE_RECORDS_DB:
        COMPLIANCE_RECORDS_DB[patient_id] = []
        
    COMPLIANCE_RECORDS_DB[patient_id].append(adherence_percent)
    
    # Calculate average
    avg = sum(COMPLIANCE_RECORDS_DB[patient_id]) / len(COMPLIANCE_RECORDS_DB[patient_id])
    return {"status": "logged", "current_adherence_avg": avg}
