from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Patient, DigitalTwin, HealthStateSnapshot

async def run_heuristic_simulation(patient_id: int, modifiers: dict, db: AsyncSession) -> dict:
    """
    Runs a heuristic what-if simulation by modifying the Twin State.
    Modifiers dict expects:
      - weight_change (kg) e.g., -5 for loss, +5 for gain
      - exercise_increase (mins/day) e.g., 30
      - sleep_change (hours/night) e.g., 1.5
      - stress_reduction (0-10) e.g., 2
    """
    # Fetch base twin state
    dt_res = await db.execute(select(DigitalTwin).where(DigitalTwin.patient_id == patient_id))
    twin = dt_res.scalars().first()

    if not twin:
        return {"error": "Patient must have a generated Digital Twin to run simulations."}

    # Copy current state for modification
    current_health_score = twin.health_score
    current_bio_age = twin.biological_age or 40
    
    projected_health_score = current_health_score
    projected_bio_age = current_bio_age
    
    organs = {
        "cardiac": twin.cardiac_health,
        "metabolic": twin.metabolic_health,
        "brain": twin.brain_health,
        "liver": twin.liver_health,
        "lung": twin.lung_health,
        "renal": twin.renal_health
    }
    
    xai_insights = []
    
    # Apply Weight Modifier
    weight_change = modifiers.get("weight_change", 0)
    if weight_change < 0:
        # Weight loss
        benefit = abs(weight_change) * 1.5
        organs["metabolic"] += benefit * 1.2
        organs["cardiac"] += benefit * 0.8
        projected_bio_age -= abs(weight_change) * 0.2
        projected_health_score += benefit
        xai_insights.append(f"Reducing weight by {abs(weight_change)}kg drives a significant {(benefit*1.2):.1f} point improvement in metabolic function by enhancing insulin sensitivity and reducing cardiac load.")
    elif weight_change > 0:
        # Weight gain
        penalty = weight_change * 1.5
        organs["metabolic"] -= penalty * 1.2
        organs["cardiac"] -= penalty * 0.8
        projected_bio_age += weight_change * 0.2
        projected_health_score -= penalty
        xai_insights.append(f"An increase in weight by {weight_change}kg introduces elevated risk vectors for metabolic syndrome and places higher load on the cardiovascular system.")
        
    # Apply Exercise Modifier
    exercise_inc = modifiers.get("exercise_increase", 0)
    if exercise_inc > 0:
        benefit = (exercise_inc / 10) * 1.2 # 1.2 pts per 10 mins
        organs["cardiac"] += benefit * 1.5
        organs["brain"] += benefit * 0.5
        projected_bio_age -= (exercise_inc / 30) * 0.5
        projected_health_score += benefit
        xai_insights.append(f"Adding {exercise_inc} minutes of daily exercise drastically improves cardiovascular ejection fraction and provides neuroprotective benefits, lowering biological age.")
        
    # Apply Sleep Modifier
    sleep_change = modifiers.get("sleep_change", 0)
    if sleep_change > 0:
        benefit = sleep_change * 3.0
        organs["brain"] += benefit * 1.5
        organs["metabolic"] += benefit * 0.8
        projected_health_score += benefit
        xai_insights.append(f"Increasing sleep by {sleep_change} hours enhances glymphatic clearance in the brain and stabilizes cortisol levels, yielding a {(benefit*1.5):.1f} point gain in neurological health.")

    # Normalize bounds
    for k in organs:
        organs[k] = max(10, min(100, organs[k]))
    
    projected_health_score = max(10, min(100, projected_health_score))
    
    return {
        "current": {
            "health_score": int(current_health_score),
            "biological_age": int(current_bio_age),
            "organs": {
                "cardiac": twin.cardiac_health,
                "metabolic": twin.metabolic_health,
                "brain": twin.brain_health
            }
        },
        "projected": {
            "health_score": int(projected_health_score),
            "biological_age": round(projected_bio_age, 1),
            "organs": {
                "cardiac": int(organs["cardiac"]),
                "metabolic": int(organs["metabolic"]),
                "brain": int(organs["brain"])
            }
        },
        "xai_insights": xai_insights
    }
