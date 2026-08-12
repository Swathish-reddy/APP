import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_current_user
from app.core.events import EVENT_DOCUMENT_UPLOADED, event_bus
from app.db.models import Document, HealthMetric, HealthTimeline, Patient, User
from app.db.session import get_db
from app.services.doc_intelligence import REFERENCE_RANGES, analyze_medical_document
from app.services.ocr_service import process_document_text

router = APIRouter()

STORAGE_DIR = "storage/documents"
os.makedirs(STORAGE_DIR, exist_ok=True)

async def process_document_background(doc_id: str, file_path: str, file_type: str, db: AsyncSession):
    # Retrieve the document from db
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        return
        
    try:
        # 1. OCR Extraction
        extracted_text = process_document_text(file_path, file_type)
        if not extracted_text:
            doc.status = "Unsupported"
            doc.ai_summary = "File uploaded successfully, but automatic medical-data extraction is unavailable for this format."
            doc.category = "Other"
            doc.report_type = "Unknown"
            await db.commit()
            return
            
        doc.extracted_text = extracted_text
        
        # 2. Intelligence Analysis
        analysis = analyze_medical_document(extracted_text)
        
        if analysis:
            doc.category = analysis.get("category", "Other")
            doc.report_type = analysis.get("report_type", "Document")
            doc.structured_data = analysis.get("structured_data", {})
            doc.abnormalities = analysis.get("abnormalities", {})
            doc.ai_summary = analysis.get("ai_summary", "")
        
        doc.status = "Completed"
        
        # 3. Update Patient metrics and other models
        if analysis:
            # Update Patient Details
            patient_details = analysis.get("patient_details", {})
            pat_res = await db.execute(select(Patient).where(Patient.patient_id == doc.patient_id))
            pat = pat_res.scalars().first()
            if pat and patient_details:
                if patient_details.get("full_name") and pat.full_name == "Demo Patient":
                    pat.full_name = patient_details.get("full_name")
                if patient_details.get("age"): pat.age = patient_details.get("age")
                if patient_details.get("gender"): pat.gender = patient_details.get("gender")
                if patient_details.get("blood_group"): pat.blood_group = patient_details.get("blood_group")
                if patient_details.get("height"): pat.height = float(patient_details.get("height"))
                if patient_details.get("weight"): pat.weight = float(patient_details.get("weight"))
                if pat.height and pat.weight:
                    pat.bmi = round(pat.weight / ((pat.height/100)**2), 1)

            # Insert Medications
            from app.db.models import (
                AIRecommendation,
                Allergy,
                MedicalHistory,
                Medication,
            )
            meds = analysis.get("medications", [])
            for m in meds:
                db.add(Medication(
                    patient_id=doc.patient_id,
                    medicine_name=m.get("medicine_name", "Unknown"),
                    dosage=m.get("dosage", ""),
                    frequency=m.get("frequency", "")
                ))
                
            # Insert Allergies
            algs = analysis.get("allergies", [])
            for a in algs:
                db.add(Allergy(
                    patient_id=doc.patient_id,
                    allergen=a.get("allergen", "Unknown"),
                    severity=a.get("severity", ""),
                    reaction=a.get("reaction", "")
                ))
                
            # Insert Medical History
            hists = analysis.get("medical_history", [])
            for h in hists:
                db.add(MedicalHistory(
                    patient_id=doc.patient_id,
                    disease_name=h.get("disease_name", "Unknown"),
                    diagnosis_date=h.get("diagnosis_date", ""),
                    status=h.get("status", "")
                ))
                
            # Insert AI Recommendations
            recs = analysis.get("recommendations", [])
            for r in recs:
                db.add(AIRecommendation(
                    patient_id=doc.patient_id,
                    category="Medical Report Insight",
                    title="Follow-up from Report",
                    description=r
                ))

            structured_data = analysis.get("structured_data", {})
            abnormalities = analysis.get("abnormalities", {})
            extracted_vitals = analysis.get("extracted_vitals", {})
            
            # Combine extracted vitals into structured_data to create metrics for them too
            if extracted_vitals:
                for k, v in extracted_vitals.items():
                    if v is not None:
                        structured_data[k] = v
                        
            for metric_key, value in structured_data.items():
                if value is None:
                    continue
                    
                # Look up reference ranges
                ref = REFERENCE_RANGES.get(metric_key.lower(), {})
                ref_min = ref.get("min")
                ref_max = ref.get("max")
                unit = ref.get("unit")
                
                status = "Normal"
                severity = "info"
                
                # Check abnormality
                if metric_key in abnormalities:
                    ab_status = abnormalities[metric_key]
                    if ab_status.lower() in ["high", "low", "abnormal", "critical"]:
                        status = ab_status
                        severity = "warning"
                
                # Create Health Metric record
                metric = HealthMetric(
                    patient_id=doc.patient_id,
                    document_id=doc.id,
                    metric_name=metric_key,
                    value=float(value) if isinstance(value, (int, float)) or (isinstance(value, str) and value.replace('.','',1).isdigit()) else None,
                    unit=unit,
                    reference_min=ref_min,
                    reference_max=ref_max,
                    status=status
                )
                
                # For string values like BP (120/80), we might need to store it differently. 
                # Since HealthMetric.value is Float, we might just store it in Timeline or handle it gracefully.
                # Actually, HealthMetric.value is Float, so string BP will fail `float(value)` if not handled.
                if isinstance(value, str) and not value.replace('.','',1).isdigit():
                    # For blood pressure, skip the metric insertion as it's a string, or add a generic timeline event
                    if metric_key == "blood_pressure":
                        timeline_event = HealthTimeline(
                            patient_id=doc.patient_id,
                            event_type="metric_recorded",
                            title="Blood Pressure Recorded",
                            description=f"Blood pressure recorded as {value}.",
                            severity="info",
                            event_meta={"metric": "blood_pressure", "value": value, "document_id": doc.id}
                        )
                        db.add(timeline_event)
                    continue

                db.add(metric)
                
                # Create Timeline Event if abnormal
                if severity == "warning":
                    timeline_event = HealthTimeline(
                        patient_id=doc.patient_id,
                        event_type="metric_abnormal",
                        title=f"Abnormal {metric_key}",
                        description=f"Value {value} {unit or ''} is {status}. Extracted from {doc.report_type}.",
                        severity="warning",
                        event_meta={"metric": metric_key, "value": value, "document_id": doc.id}
                    )
                    db.add(timeline_event)
            
            # Create a Timeline Event for the report upload
            upload_event = HealthTimeline(
                patient_id=doc.patient_id,
                event_type="report_uploaded",
                title=f"{doc.report_type} Uploaded",
                description=f"A new {doc.report_type} was successfully ingested and analyzed.",
                severity="success",
                event_meta={"document_id": doc.id, "category": doc.category}
            )
            db.add(upload_event)
        
        await db.commit()
        
        # 4. Refresh Digital Twin & generate AI recommendations automatically
        try:
            from app.services.digital_twin import generate_twin_state
            await generate_twin_state(doc.patient_id, db)
        except Exception as twin_err:
            print(f"Twin refresh error (non-critical): {twin_err}")
        
        # Publish event
        await event_bus.publish(EVENT_DOCUMENT_UPLOADED, {
            "document_id": doc.id,
            "patient_id": doc.patient_id,
            "category": doc.category,
            "structured_data": doc.structured_data,
            "abnormalities": doc.abnormalities
        })
    except Exception as e:
        print(f"Background processing error: {e}")
        doc.status = "Failed"
        doc.ai_summary = f"Error during processing: {e!s}"
        await db.commit()

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    patient_id: int = Form(...),
    force: bool = Form(False),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Executable validation
    ext = file.filename.split('.')[-1].lower() if file.filename else ""
    dangerous_exts = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'msi', 'js', 'vbs', 'com', 'scr', 'pif']
    if ext in dangerous_exts:
        raise HTTPException(status_code=400, detail="Executable files are strictly prohibited for security reasons.")
        
    # Size validation (20MB limit)
    file.file.seek(0, 2) # Seek to end
    file_size = file.file.tell()
    file.file.seek(0) # Reset to beginning
    if file_size > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")

    # Duplicate check
    if not force:
        dup_res = await db.execute(select(Document).where(
            Document.patient_id == patient_id, 
            Document.file_name == file.filename, 
            Document.file_size == file_size
        ))
        if dup_res.scalars().first():
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=409, content={"detail": "duplicate_file", "message": "This file already exists."})

    # Verify patient
    result = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    pat = result.scalars().first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
        
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(STORAGE_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB entry
    new_doc = Document(
        patient_id=patient_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=os.path.getsize(file_path)
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    
    # Trigger background task
    background_tasks.add_task(process_document_background, new_doc.id, file_path, file.content_type, db)
    
    return {"message": "Document uploaded and processing started", "document_id": new_doc.id}

@router.get("/patient/{patient_id}")
async def get_patient_documents(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify patient ownership
    result_pat = await db.execute(select(Patient).where(Patient.patient_id == patient_id, Patient.owner_id == current_user.id))
    pat = result_pat.scalars().first()
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
        
    result = await db.execute(select(Document).where(Document.patient_id == patient_id).order_by(Document.upload_date.desc()))
    return result.scalars().all()

@router.get("/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check patient ownership
    pat = await db.execute(select(Patient).where(Patient.patient_id == doc.patient_id, Patient.owner_id == current_user.id))
    if not pat.scalars().first():
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return doc

from fastapi.responses import FileResponse

@router.get("/{doc_id}/download")
async def download_document(doc_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check patient ownership
    pat = await db.execute(select(Patient).where(Patient.patient_id == doc.patient_id, Patient.owner_id == current_user.id))
    if not pat.scalars().first():
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(doc.file_path, filename=doc.file_name, media_type=doc.file_type)

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check patient ownership
    pat = await db.execute(select(Patient).where(Patient.patient_id == doc.patient_id, Patient.owner_id == current_user.id))
    if not pat.scalars().first():
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Delete file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}

