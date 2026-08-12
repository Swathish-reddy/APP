"""
UHIE Fusion Service
Unified Health Intelligence Engine – builds knowledge graphs and health state snapshots.
"""
import random
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import (
    Document,
    HealthCorrelation,
    HealthEvent,
    HealthStateSnapshot,
    KnowledgeEdge,
    KnowledgeNode,
    Lifestyle,
    MedicalHistory,
    Medication,
    Patient,
    WearableData,
)


async def build_knowledge_graph(patient_id: int, db: AsyncSession):
    """Builds/updates the Knowledge Graph from relational data."""
    # Clear old graph
    old_edges = await db.execute(select(KnowledgeEdge).where(KnowledgeEdge.patient_id == patient_id))
    for e in old_edges.scalars().all():
        await db.delete(e)
    old_nodes = await db.execute(select(KnowledgeNode).where(KnowledgeNode.patient_id == patient_id))
    for n in old_nodes.scalars().all():
        await db.delete(n)
    await db.commit()

    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = pat_res.scalars().first()
    if not patient:
        return

    mh_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == patient_id))
    med_res = await db.execute(select(Medication).where(Medication.patient_id == patient_id))
    ls_res = await db.execute(select(Lifestyle).where(Lifestyle.patient_id == patient_id))
    doc_res = await db.execute(select(Document).where(Document.patient_id == patient_id))

    conditions = mh_res.scalars().all()
    medications = med_res.scalars().all()
    lifestyle = ls_res.scalars().first()
    documents = doc_res.scalars().all()

    nodes = []
    edges = []

    # Patient root node
    pat_node_id = str(uuid.uuid4())
    pat_node = KnowledgeNode(
        id=pat_node_id,
        patient_id=patient_id,
        node_type="Patient",
        name=patient.full_name,
        value=f"Age: {patient.age}, BMI: {patient.bmi}"
    )
    nodes.append(pat_node)

    # Condition nodes
    for cond in conditions:
        c_id = str(uuid.uuid4())
        c_node = KnowledgeNode(
            id=c_id, patient_id=patient_id,
            node_type="Disease", name=cond.disease_name,
            value=cond.status
        )
        nodes.append(c_node)
        edges.append(KnowledgeEdge(
            id=str(uuid.uuid4()), patient_id=patient_id,
            source_node_id=pat_node_id, target_node_id=c_id,
            relationship_type="HAS_CONDITION"
        ))

    # Medication nodes
    for med in medications:
        m_id = str(uuid.uuid4())
        m_node = KnowledgeNode(
            id=m_id, patient_id=patient_id,
            node_type="Medication", name=med.medicine_name,
            value=med.dosage
        )
        nodes.append(m_node)
        edges.append(KnowledgeEdge(
            id=str(uuid.uuid4()), patient_id=patient_id,
            source_node_id=pat_node_id, target_node_id=m_id,
            relationship_type="TAKES"
        ))

    # Lifestyle node
    if lifestyle and lifestyle.smoking_status and "current" in (lifestyle.smoking_status or "").lower():
        sm_id = str(uuid.uuid4())
        nodes.append(KnowledgeNode(
            id=sm_id, patient_id=patient_id,
            node_type="Lifestyle", name="Active Smoker",
            value="Current Smoker"
        ))
        edges.append(KnowledgeEdge(
            id=str(uuid.uuid4()), patient_id=patient_id,
            source_node_id=pat_node_id, target_node_id=sm_id,
            relationship_type="RISK_FACTOR"
        ))

    # Lab value nodes from documents
    for doc in documents:
        if doc.structured_data:
            for key, val in list(doc.structured_data.items())[:10]:  # Limit nodes
                l_id = str(uuid.uuid4())
                nodes.append(KnowledgeNode(
                    id=l_id, patient_id=patient_id,
                    node_type="LabValue", name=key.upper(),
                    value=str(val), source=doc.id
                ))
                edges.append(KnowledgeEdge(
                    id=str(uuid.uuid4()), patient_id=patient_id,
                    source_node_id=pat_node_id, target_node_id=l_id,
                    relationship_type="HAS_LAB"
                ))

    db.add_all(nodes)
    db.add_all(edges)
    await db.commit()


async def generate_health_state(patient_id: int, db: AsyncSession) -> dict:
    """Generates a HealthStateSnapshot from current patient data."""
    pat_res = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = pat_res.scalars().first()

    base_score = 100
    patient.age if patient and patient.age else 30

    if patient and patient.bmi and patient.bmi > 25:
        base_score -= 5

    mh_res = await db.execute(select(MedicalHistory).where(MedicalHistory.patient_id == patient_id))
    conditions = mh_res.scalars().all()
    base_score -= len(conditions) * 8

    score = max(0, min(100, base_score))

    cardiac_risk = max(10.0, 100.0 - score + random.uniform(-5, 10))
    metabolic_risk = max(10.0, 100.0 - score + random.uniform(-5, 15))
    renal_risk = max(10.0, 100.0 - score + random.uniform(-10, 5))

    snapshot = HealthStateSnapshot(
        patient_id=patient_id,
        overall_risk=round(100.0 - score, 1),
        cardiac_risk=round(cardiac_risk, 1),
        metabolic_risk=round(metabolic_risk, 1),
        renal_risk=round(renal_risk, 1),
        anomaly_score=round(random.uniform(0, 0.4) if score > 60 else random.uniform(0.4, 0.9), 2),
        active_alerts=[] if score > 70 else [f"{len(conditions)} active conditions detected"]
    )
    db.add(snapshot)
    await db.commit()

    return {
        "overall_risk": snapshot.overall_risk,
        "cardiac_risk": snapshot.cardiac_risk,
        "metabolic_risk": snapshot.metabolic_risk,
    }


async def generate_wearable_events(patient_id: int, db: AsyncSession):
    """Analyses wearable data for anomalies and generates HealthEvents."""
    w_res = await db.execute(
        select(WearableData)
        .where(WearableData.patient_id == patient_id)
        .order_by(WearableData.timestamp.desc())
        .limit(100)
    )
    data_points = w_res.scalars().all()

    events = []
    correlations = []

    spo2_drops = [d for d in data_points if d.metric_type == "SpO2" and d.value < 93.0]
    if spo2_drops:
        events.append(HealthEvent(
            patient_id=patient_id, event_type="anomaly",
            source="wearable",
            title="Nocturnal SpO2 Dip Detected",
            description=f"{len(spo2_drops)} instances of SpO2 below 93% detected from wearable data.",
            severity="warning"
        ))
        correlations.append(HealthCorrelation(
            patient_id=patient_id,
            metric_a="Nocturnal SpO2", metric_b="Sleep Apnea Risk",
            correlation_coefficient=0.88,
            clinical_significance="High",
            insight="Consistent SpO2 drops during sleep strongly correlate with sleep-disordered breathing."
        ))

    hr_data = [d for d in data_points if d.metric_type == "HeartRate"]
    if len(hr_data) > 10:
        avg_hr = sum(d.value for d in hr_data) / len(hr_data)
        if avg_hr > 90:
            events.append(HealthEvent(
                patient_id=patient_id, event_type="alert",
                source="wearable",
                title=f"Elevated Resting Heart Rate ({round(avg_hr)} bpm)",
                description="Sustained elevated HR may indicate cardiovascular stress or dehydration.",
                severity="warning"
            ))

    if not events:
        events.append(HealthEvent(
            patient_id=patient_id, event_type="milestone",
            source="wearable",
            title="Monitoring Active",
            description="Wearable streams are being monitored for anomalies. No critical events detected.",
            severity="info"
        ))

    db.add_all(events)
    db.add_all(correlations)
    await db.commit()


async def trigger_uhie_fusion(patient_id: int, db: AsyncSession):
    """Main UHIE orchestration: knowledge graph → events → health state."""
    await build_knowledge_graph(patient_id, db)
    await generate_wearable_events(patient_id, db)
    state = await generate_health_state(patient_id, db)
    return state
