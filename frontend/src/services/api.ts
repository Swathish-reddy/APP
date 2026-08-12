const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};
const _envUrl = getApiUrl();
export const BASE_URL = _envUrl.endsWith('/api/v1') ? _envUrl : `${_envUrl}/api/v1`;
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/vitals';

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }
  return res;
};

export interface PatientSummary { id: string; name: string; age: number; gender: string; overall_health_score: number; readmission_risk: string; }
export interface VitalRecord { heart_rate: number; systolic_bp: number; diastolic_bp: number; spo2: number; temperature: number; respiratory_rate: number; glucose: number; }
export interface LabRecord { cholesterol_total: number; cholesterol_ldl: number; cholesterol_hdl: number; hba1c: number; creatinine: number; egfr: number; ast: number; alt: number; fev1_percent: number; }
export interface LifestyleRecord { average_steps_day: number; sleep_hours: number; sleep_quality_percent: number; stress_level_scale_10: number; smoking_status: string; diet_type: string; alcohol_intake: string; }
export interface MedItem { name: string; dosage: string; schedule: string; }
export interface PatientDetails {
  demographics: { id: string; name: string; age: number; gender: string; weight_kg: number; height_cm: number; bmi: number; blood_group: string; location: string; contact: string; };
  vitals: VitalRecord;
  labs: LabRecord;
  lifestyle: LifestyleRecord;
  clinical: { medical_history: string[]; active_medications: MedItem[]; allergies: string[]; symptoms: string[]; };
  metrics: { overall_health_score: number; biological_age: number; life_expectancy: number; readmission_risk: string; readmission_risk_percent: number; organ_health: { heart: number; kidney: number; liver: number; lung: number; brain: number; }; };
  ai_fusion: { predictions: { [key: string]: { risk_percent: number; severity: string; confidence_score: number; models_breakdown: { machine_learning: number; deep_learning: number; rule_engine: number; }; rules_triggered: string[]; }; }; xai_shap: Array<{ name: string; value: string; impact: number; reason: string; }>; };
  medication_safety: { drug_interactions: Array<{ drug_a: string; drug_b: string; severity: string; interaction: string; side_effects: string[]; }>; side_effects: { [medName: string]: string[]; }; };
}
export interface SimulationResult {
  original: { health_score: number; biological_age: number; life_expectancy: number; readmission_risk: string; organ_health: { [key: string]: number }; systolic_bp: number; glucose: number; hba1c: number; cholesterol_ldl: number; };
  simulated: { health_score: number; biological_age: number; life_expectancy: number; readmission_risk: string; organ_health: { [key: string]: number }; systolic_bp: number; glucose: number; hba1c: number; cholesterol_ldl: number; };
}
export interface ClinicalRecommendations {
  doctors: Array<{ id: string; name: string; specialization: string; experience_years: number; qualification: string; rating: number; consultation_fee: number; availability: string; location: string; reviews: Array<{ user: string; rating: number; comment: string }>; match_score: number; }>;
  hospitals: Array<{ id: string; name: string; specialty: string; infrastructure: string; icu_availability: number; success_rate: number; rating: number; distance_miles: number; cost_estimate: string; match_score: number; }>;
  clinical_decisions: Array<{ diagnosis: string; tests: string[]; treatments: string[]; reasoning: string; }>;
}
export interface DietPlan {
  diet_type_recommended: string; tdee_cal: number; target_calories: number; water_intake_liters: number;
  macronutrients: { percentage: { carbs_percent: number; protein_percent: number; fat_percent: number }; grams: { carbohydrates: number; proteins: number; fats: number }; };
  micronutrients: string[];
  daily_sample: { breakfast: string; lunch: string; dinner: string; snack: string; };
  weekly_plan: Array<{ day: string; breakfast: string; lunch: string; dinner: string; snack: string; }>;
}

export const api = { 
  async getPatients(): Promise<PatientSummary[]> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients`, { headers: { ...getAuthHeaders() } }); 
      if (!res.ok) throw new Error('Failed to fetch patients list'); 
      const data = await res.json();
      return data.map((p: { patient_id: number | string; full_name: string; age?: number; gender?: string }) => ({
        id: p.patient_id.toString(),
        name: p.full_name,
        age: p.age || 45,
        gender: p.gender || "Unknown",
        overall_health_score: 85,
        readmission_risk: "Low"
      }));
    } catch (error) {
      console.error("getPatients error:", error);
      return [];
    }
  }, 
  
  async getPatientDetails(id: string): Promise<PatientDetails | null> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/unified`, { headers: { ...getAuthHeaders() } }); 
      if (!res.ok) throw new Error(`Failed to fetch details for patient ${id}`); 
      return await res.json();
    } catch (error) {
      // Silenced error logging to avoid Next.js dev overlay
      return null;
    }
  }, 
  
  async registerPatient(patientData: Record<string, unknown>): Promise<{ message: string; patient_id: string } | null> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, 
        body: JSON.stringify(patientData) 
      }); 
      if (!res.ok) throw new Error('Failed to register digital twin patient'); 
      return await res.json();
    } catch (error) {
      console.error("registerPatient error:", error);
      return null;
    }
  }, 
  
  async simulateWhatIf(id: string, scenarios: Record<string, unknown>): Promise<SimulationResult | null> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/simulate`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, 
        body: JSON.stringify(scenarios) 
      }); 
      if (!res.ok) throw new Error('Simulation calculation failed'); 
      return await res.json();
    } catch (error) {
      console.error("simulateWhatIf error:", error);
      return null;
    }
  }, 
  
  async getClinicalRecommendations(id: string): Promise<ClinicalRecommendations | null> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/recommendations`, { headers: { ...getAuthHeaders() } }); 
      if (!res.ok) throw new Error('Failed to fetch clinical recommendations'); 
      return await res.json();
    } catch (error) {
      console.error("getClinicalRecommendations error:", error);
      return null;
    }
  }, 
  
  async getPatientDiet(id: string): Promise<DietPlan | null> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/diet`, { headers: { ...getAuthHeaders() } }); 
      if (!res.ok) throw new Error('Failed to fetch diet details'); 
      return await res.json();
    } catch (error) {
      console.error("getPatientDiet error:", error);
      return null;
    }
  }, 
  
  async chatWithAssistant(id: string, message: string): Promise<{ reply: string }> { 
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/chat`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, 
        body: JSON.stringify({ message }) 
      }); 
      if (!res.ok) throw new Error('Chatbot query failed'); 
      return await res.json();
    } catch (error) {
      console.error("chatWithAssistant error:", error);
      return { reply: "I am unable to reach the server at this moment. Please try again later." };
    }
  },   
  
  getWebSocketUri(id: string): string { 
    return `${WS_BASE_URL}/${id}`; 
  },
  
  async getTimeline(id: string): Promise<any[]> {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/patients/${id}/timeline`, {
        headers: { ...getAuthHeaders() }
      });
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      if (!res.ok) throw new Error('Failed to fetch timeline');
      return await res.json();
    } catch (error) {
      // Silenced error logging to avoid Next.js dev overlay
      return [];
    }
  }
};
