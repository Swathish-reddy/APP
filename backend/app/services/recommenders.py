from typing import Any

from app.db.db import DOCTORS_DB, HOSPITALS_DB


def recommend_doctors(diseases: list[str], patient_location: str) -> list[dict[str, Any]]:
    """
    Matches and ranks doctors based on patient's predicted diseases or conditions.
    Scores them on rating, distance match, and specialization overlap.
    """
    recommended = []
    
    # Map patient predicted diseases to doctor specialization keywords
    specialization_mapping = {
        "Cardiovascular": ["Cardiologist"],
        "Diabetes": ["Endocrinologist"],
        "Respiratory": ["Pulmonologist"],
        "Kidney": ["Nephrologist"],
        "Liver": ["Gastroenterologist"],
        "Neurological": ["Neurologist", "Geriatrician"]
    }
    
    # Find matching specializations
    target_specs = []
    for d in diseases:
        if d in specialization_mapping:
            target_specs.extend(specialization_mapping[d])
            
    for doc in DOCTORS_DB:
        match_score = 50.0 # base score
        
        # Specialty match
        if doc["specialization"] in target_specs:
            match_score += 30.0
        elif any(spec in doc["specialization"] for spec in target_specs):
            match_score += 15.0
            
        # Location match
        # If doctor in same city/state
        patient_city = patient_location.split(",")[0].strip().lower()
        doc_city = doc["location"].split(",")[0].strip().lower()
        if patient_city == doc_city:
            match_score += 15.0
            
        # Rating contribution
        match_score += (doc["rating"] - 4.0) * 5.0 # rating bonus
        
        # Experience contribution
        match_score += min(5.0, doc["experience_years"] * 0.25)
        
        # Sort key: match score
        rec_doc = doc.copy()
        rec_doc["match_score"] = round(min(100.0, match_score), 1)
        recommended.append(rec_doc)
        
    # Sort by match score descending
    recommended.sort(key=lambda x: x["match_score"], reverse=True)
    return recommended

def recommend_hospitals(diseases: list[str], patient_location: str) -> list[dict[str, Any]]:
    """
    Matches and ranks hospitals based on specialties, infrastructure availability, 
    success rate, patient rating, and calculated distance.
    """
    recommended = []
    
    # Determine the urgency factor
    is_urgent = False
    if "Cardiovascular" in diseases or "Respiratory" in diseases:
        is_urgent = True
        
    for hosp in HOSPITALS_DB:
        hosp_copy = hosp.copy()
        
        # Calculate dynamic matching score
        base_score = hosp["ranking_score"]
        
        # Adjust distance score (shorter distance is better, especially for emergencies)
        distance_factor = max(0, 10 - hosp["distance_miles"])
        distance_points = distance_factor * 1.5 if is_urgent else distance_factor * 0.8
        
        # Specialty match
        specialty_match = 0
        hosp_specialties_lower = hosp["specialty"].lower()
        for d in diseases:
            if d.lower() in hosp_specialties_lower:
                specialty_match += 10
            elif d == "Cardiovascular" and "cardiology" in hosp_specialties_lower or d == "Kidney" and "nephrology" in hosp_specialties_lower or d == "Respiratory" and "pulmonology" in hosp_specialties_lower:
                specialty_match += 12
                
        # ICU availability bonus during emergency
        icu_points = 0
        if is_urgent:
            icu_beds = hosp["icu_availability"]
            if icu_beds > 10:
                icu_points += 15
            elif icu_beds > 5:
                icu_points += 8
            elif icu_beds > 0:
                icu_points += 3
            else:
                icu_points -= 10 # penalty if full
                
        final_score = base_score + distance_points + specialty_match + icu_points
        hosp_copy["match_score"] = round(min(100.0, final_score), 1)
        
        recommended.append(hosp_copy)
        
    recommended.sort(key=lambda x: x["match_score"], reverse=True)
    return recommended
