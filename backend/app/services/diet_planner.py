from typing import Dict, Any, List

# Basic menus depending on clinical diets
DIET_PLANS = {
    "Diabetes": {
        "breakfast": [
            "Avocado toast on whole grain bread with 2 poached eggs (Fiber & Protein)",
            "Unsweetened Greek yogurt with chia seeds, flaxseeds, and raspberries",
            "Spinach and mushroom egg-white omelet with a side of sliced tomatoes"
        ],
        "lunch": [
            "Grilled chicken breast over mixed greens with cucumbers, pumpkin seeds, and olive oil",
            "Quinoa bowl with black beans, roasted bell peppers, grilled tofu, and cilantro-lime dressing",
            "Lentil soup with a side salad of spinach and shredded carrots"
        ],
        "dinner": [
            "Baked salmon fillet with grilled asparagus and garlic cauliflower mash",
            "Stir-fried lean turkey breast with broccoli, snap peas, and bok choy in low-sodium soy sauce",
            "Herb-crusted sea bass with roasted Brussels sprouts and a small portion of wild rice"
        ],
        "snacks": ["A handful of raw almonds", "Celery sticks with natural peanut butter", "Cucumber slices with hummus"],
        "macronutrients": {"carbs_percent": 35, "protein_percent": 35, "fat_percent": 30},
        "micronutrients": ["Magnesium: 400 mg (Supports insulin function)", "Chromium: 200 mcg", "Fiber: 35g"]
    },
    "Kidney": {
        "breakfast": [
            "Cream of wheat topped with fresh blueberries and a splash of rice milk",
            "Egg white omelet with green bell peppers and onions, served with one slice of white toast",
            "Apple cinnamon oatmeal prepared with water (no added salt or phosphorus)"
        ],
        "lunch": [
            "Turkey sandwich on sourdough bread with lettuce, cucumber (no cheese, no mayo)",
            "Napa cabbage salad with shredded carrots, grilled chicken breast, and ginger-sesame vinaigrette",
            "Rice vermicelli noodle salad with grilled shrimp, cucumbers, and mint"
        ],
        "dinner": [
            "Baked cod fillet with steamed white rice and roasted cauliflower",
            "Grilled pork tenderloin with cabbage steak and a side of green beans",
            "Pan-seared chicken breast with roasted zucchini and yellow squash (low potassium/phosphorus)"
        ],
        "snacks": ["Fresh red grapes", "Slices of fresh apple", "Unsalted rice cakes"],
        "macronutrients": {"carbs_percent": 50, "protein_percent": 15, "fat_percent": 35}, # Low protein
        "micronutrients": ["Sodium restriction: < 1500 mg", "Potassium restriction: < 2000 mg", "Phosphorus restriction: < 800 mg"]
    },
    "Cardiac": {
        "breakfast": [
            "Steel-cut oats cooked in almond milk with walnuts, chia seeds, and fresh strawberries",
            "Fruit smoothie with spinach, kale, bananas, and ground flaxseeds",
            "Tofu scramble with spinach, bell peppers, turmeric, and garlic"
        ],
        "lunch": [
            "Quinoa and roasted vegetable salad (zucchini, eggplant, bell peppers) with extra virgin olive oil",
            "Flounder fillet with steamed broccoli and a side of brown rice",
            "Black bean and sweet potato chili (low sodium)"
        ],
        "dinner": [
            "Grilled mackerel with lemon-dill sauce, steamed spinach, and roasted baby potatoes",
            "Grilled turkey breast with sautéed Swiss chard and quinoa",
            "Baked trout with garlic-parsley cauliflower florets and steamed asparagus"
        ],
        "snacks": ["Walnuts & pumpkin seeds", "Air-popped unsalted popcorn", "Fresh orange slices"],
        "macronutrients": {"carbs_percent": 45, "protein_percent": 25, "fat_percent": 30},
        "micronutrients": ["Sodium restriction: < 1200 mg", "Omega-3 Fatty Acids: 2000 mg", "Potassium: 3500 mg (helps lower BP)"]
    },
    "Weight Loss": {
        "breakfast": [
            "Scrambled eggs with spinach and a side of half grapefruit",
            "Low-fat cottage cheese with sliced strawberries and pumpkin seeds",
            "Chia seed pudding made with unsweetened almond milk and berries"
        ],
        "lunch": [
            "Large garden salad with grilled chicken breast, boiled egg, lemon juice dressing",
            "Tuna salad (made with Greek yogurt instead of mayo) wrapped in large collard green leaves",
            "Spiced lentil soup with steamed asparagus"
        ],
        "dinner": [
            "Baked chicken breast with roasted broccoli and side of mashed cauliflower",
            "Seared cod with garlic sautéed kale and grilled bell peppers",
            "Lean ground beef stir-fry with zucchini noodles, mushrooms, and bell peppers"
        ],
        "snacks": ["Hard-boiled egg", "Celery with salsa", "Handful of baby carrots"],
        "macronutrients": {"carbs_percent": 30, "protein_percent": 40, "fat_percent": 30}, # High protein
        "micronutrients": ["Fiber: 40g (supports satiety)", "Vitamin D: 1000 IU", "Calcium: 1000 mg"]
    }
}

def generate_diet_plan(age: int, gender: str, weight_kg: float, height_cm: float,
                       medical_history: List[str], allergies: List[str], activity_level: str) -> Dict[str, Any]:
    """Generates a customized, disease-specific daily/weekly meal plan and nutrient guidelines."""
    # Determine the primary clinical diet target
    primary_diet = "Weight Loss" # default
    
    if "Chronic Kidney Disease" in "".join(medical_history) or "CKD" in "".join(medical_history):
        primary_diet = "Kidney"
    elif "Type 2 Diabetes" in "".join(medical_history) or "Diabetes" in "".join(medical_history):
        primary_diet = "Diabetes"
    elif "Hypertension" in "".join(medical_history) or "Cardiovascular" in "".join(medical_history):
        primary_diet = "Cardiac"
        
    base_diet = DIET_PLANS[primary_diet]
    
    # Calculate calorie needs using Harris-Benedict Equation
    if gender == "Female":
        bmr = 655.1 + (9.563 * weight_kg) + (1.850 * height_cm) - (4.676 * age)
    else:
        bmr = 66.47 + (13.75 * weight_kg) + (5.003 * height_cm) - (6.755 * age)
        
    # Activity multiplier
    multipliers = {
        "Sedentary": 1.2,
        "Moderately Active": 1.55,
        "Highly Active": 1.925
    }
    multiplier = multipliers.get(activity_level, 1.375)
    tdee = int(bmr * multiplier)
    
    # Adjust target calories based on primary diet
    target_calories = tdee
    if primary_diet == "Weight Loss":
        target_calories = tdee - 500 # Caloric deficit
    elif primary_diet == "Diabetes" or primary_diet == "Cardiac":
        target_calories = tdee - 200 # Slight reduction for metabolic health
        
    target_calories = max(1200, target_calories)
    
    # Calculate macro breakdown in grams
    # 1g carb = 4 kcal, 1g protein = 4 kcal, 1g fat = 9 kcal
    macros = base_diet["macronutrients"]
    carb_g = int((target_calories * (macros["carbs_percent"] / 100)) / 4)
    protein_g = int((target_calories * (macros["protein_percent"] / 100)) / 4)
    fat_g = int((target_calories * (macros["fat_percent"] / 100)) / 9)
    
    # Filter meals based on allergies
    allergies_lower = [a.lower() for a in allergies]
    
    def is_safe(meal_text: str) -> bool:
        meal_lower = meal_text.lower()
        for allergen in allergies_lower:
            # Simple keyword matching
            if allergen in meal_lower:
                return False
            # Common allergen matches
            if allergen == "penicillin":
                continue # not food
            if allergen == "peanuts" and "peanut" in meal_lower:
                return False
            if allergen == "nuts" and ("almond" in meal_lower or "walnut" in meal_lower or "peanut" in meal_lower or "pumpkin seeds" in meal_lower):
                return False
            if allergen == "fish" and ("salmon" in meal_lower or "cod" in meal_lower or "sea bass" in meal_lower or "trout" in meal_lower or "mackerel" in meal_lower or "shrimp" in meal_lower or "tuna" in meal_lower):
                return False
            if allergen == "eggs" and ("egg" in meal_lower or "omelet" in meal_lower):
                return False
            if allergen == "dairy" and ("yogurt" in meal_lower or "cheese" in meal_lower or "milk" in meal_lower):
                return False
        return True
        
    filtered_breakfast = [m for m in base_diet["breakfast"] if is_safe(m)]
    filtered_lunch = [m for m in base_diet["lunch"] if is_safe(m)]
    filtered_dinner = [m for m in base_diet["dinner"] if is_safe(m)]
    filtered_snacks = [m for m in base_diet["snacks"] if is_safe(m)]
    
    # Fallback to simple safe foods if all matching options got filtered
    if not filtered_breakfast:
        filtered_breakfast = ["Oatmeal with chia seeds (prepared with water)"]
    if not filtered_lunch:
        filtered_lunch = ["Grilled chicken breast salad with olive oil"]
    if not filtered_dinner:
        filtered_dinner = ["Baked white fish with roasted broccoli"]
    if not filtered_snacks:
        filtered_snacks = ["Slices of fresh apple or pear"]

    # Calculate weekly plan (alternating items)
    weekly_schedule = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for i, day in enumerate(days):
        weekly_schedule.append({
            "day": day,
            "breakfast": filtered_breakfast[i % len(filtered_breakfast)],
            "lunch": filtered_lunch[i % len(filtered_lunch)],
            "dinner": filtered_dinner[i % len(filtered_dinner)],
            "snack": filtered_snacks[i % len(filtered_snacks)]
        })

    # Recommended water intake based on weight
    water_liters = round((weight_kg * 0.033), 1)

    return {
        "diet_type_recommended": f"Clinical {primary_diet} Diet Plan",
        "tdee_cal": tdee,
        "target_calories": target_calories,
        "water_intake_liters": water_liters,
        "macronutrients": {
            "percentage": macros,
            "grams": {
                "carbohydrates": carb_g,
                "proteins": protein_g,
                "fats": fat_g
            }
        },
        "micronutrients": base_diet["micronutrients"],
        "daily_sample": {
            "breakfast": filtered_breakfast[0],
            "lunch": filtered_lunch[0],
            "dinner": filtered_dinner[0],
            "snack": filtered_snacks[0]
        },
        "weekly_plan": weekly_schedule
    }
