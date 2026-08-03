export interface TwinState {
  cardiac_health: number;
  brain_health: number;
  lung_health: number;
  liver_health: number;
  renal_health: number;
  metabolic_health: number;
}

export interface Prediction {
  metric_name: string;
  confidence_level: number;
  current_value: number;
  projected_value: number;
  timeframe_months: number;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  daily_plan?: {
    breakfast?: Meal;
    lunch?: Meal;
    snacks?: Meal;
    dinner?: Meal;
  };
  goals?: {
    macros_percent?: Record<string, number>;
  };
  impact?: Record<string, string>;
}

export interface GroceryList {
  items?: { name: string; category: string; reason: string }[];
}

export interface NutritionCompliance {
  adherence_percent?: number;
  status?: string;
}

export interface DietData {
  "3_daily_energy_requirements"?: { target_calories: number };
  "4_macronutrient_requirements"?: { protein: string; carbs: string; fats: string };
  "11_hydration_plan"?: string;
  "10_foods_to_avoid"?: string[];
  "8_personalized_meal_plan"?: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  battery: number;
  last_sync: string;
  signal_strength: number;
}

export interface Alert {
  severity: string;
  message: string;
  type?: string;
  time: string;
  confidence?: number;
  recommended_action?: string;
  doctor_notification?: string;
}

export interface StreamData {
  vitals?: {
    heart_rate?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    spo2?: number;
    glucose?: number;
  };
}

export interface AIPredictionResponse {
  predictions?: Prediction[];
}
