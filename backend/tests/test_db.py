from app.db.db import (
    INITIAL_PATIENTS,
    DOCTORS_DB,
    get_drug_interactions
)

def test_patients_db_initialized():
    assert "P101" in INITIAL_PATIENTS
    assert INITIAL_PATIENTS["P101"]["name"] == "Sarah Jenkins"

def test_doctors_db_initialized():
    assert len(DOCTORS_DB) > 0
    assert DOCTORS_DB[0]["id"] == "D1"

def test_get_drug_interactions():
    drugs = ["Metformin", "Contrast Dye"]
    interactions = get_drug_interactions(drugs)
    assert len(interactions) == 1
    assert interactions[0]["severity"] == "High"
    
    # Test safe combo
    safe_drugs = ["Metformin", "Vitamin C"]
    interactions = get_drug_interactions(safe_drugs)
    assert len(interactions) == 0

def test_drug_interactions_reverse_order():
    drugs = ["Contrast Dye", "Metformin"]
    interactions = get_drug_interactions(drugs)
    assert len(interactions) == 1
    assert interactions[0]["severity"] == "High"
