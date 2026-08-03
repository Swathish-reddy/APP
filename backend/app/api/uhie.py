"""UHIE (Unified Health Intelligence Engine) API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.db.models import (
    Patient, KnowledgeNode, KnowledgeEdge, HealthStateSnapshot,
    HealthEvent, HealthCorrelation, User
)
from app.api.deps import get_current_user
from app.services.uhie_fusion import trigger_uhie_fusion

router = APIRouter()


@router.post("/patient/{patient_id}/fuse")
async def fuse_patient_data(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers the Multi-Modal Health Data Fusion Engine for a patient."""
    res = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    if not res.scalars().first():
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    state = await trigger_uhie_fusion(patient_id, db)
    return {"message": "UHIE Data Fusion Complete", "state": state}


@router.get("/patient/{patient_id}/state")
async def get_patient_state(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the latest health state snapshot for the patient."""
    res = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    if not res.scalars().first():
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    snap_res = await db.execute(
        select(HealthStateSnapshot)
        .where(HealthStateSnapshot.patient_id == patient_id)
        .order_by(HealthStateSnapshot.timestamp.desc())
    )
    state = snap_res.scalars().first()

    if not state:
        await trigger_uhie_fusion(patient_id, db)
        snap_res = await db.execute(
            select(HealthStateSnapshot)
            .where(HealthStateSnapshot.patient_id == patient_id)
            .order_by(HealthStateSnapshot.timestamp.desc())
        )
        state = snap_res.scalars().first()

    return state


@router.get("/patient/{patient_id}/graph")
async def get_knowledge_graph(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the knowledge graph nodes and edges for a patient."""
    n_res = await db.execute(select(KnowledgeNode).where(KnowledgeNode.patient_id == patient_id))
    e_res = await db.execute(select(KnowledgeEdge).where(KnowledgeEdge.patient_id == patient_id))

    nodes = n_res.scalars().all()
    edges = e_res.scalars().all()

    return {
        "nodes": [{"id": n.id, "type": n.node_type, "name": n.name, "val": 1} for n in nodes],
        "links": [{"source": e.source_node_id, "target": e.target_node_id, "type": e.relationship_type} for e in edges]
    }


@router.get("/patient/{patient_id}/events")
async def get_health_events(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns all health events for the patient."""
    res = await db.execute(
        select(HealthEvent)
        .where(HealthEvent.patient_id == patient_id)
        .order_by(HealthEvent.timestamp.desc())
    )
    return res.scalars().all()


@router.get("/patient/{patient_id}/correlations")
async def get_health_correlations(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns detected health metric correlations for the patient."""
    res = await db.execute(
        select(HealthCorrelation)
        .where(HealthCorrelation.patient_id == patient_id)
        .order_by(HealthCorrelation.timestamp.desc())
    )
    return res.scalars().all()
