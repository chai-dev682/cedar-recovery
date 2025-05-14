from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import crud, schemas, dependencies
from datetime import datetime
import pytz

router = APIRouter(prefix="/api/patients", tags=["patients"])

def is_today_est(date_to_check):
    est = pytz.timezone('US/Eastern')
    now_est = datetime.now(est).date()
    return date_to_check == now_est

@router.post("/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(dependencies.get_db)):
    db_patient1 = crud.get_patient_by_mri(db, mri=patient.mri)
    if db_patient1:
        raise HTTPException(status_code=400, detail="Patient with this MRI already exists")
    patient_data = schemas.Patient.from_orm(crud.create_patient(db=db, patient=patient)).dict()
    patient_data['today_flag'] = is_today_est(patient.next_med_count)
    return patient_data

@router.get("/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db)):
    patients = crud.get_patients(db, skip=skip, limit=limit)
    result = []
    for patient in patients:
        patient_data = schemas.Patient.from_orm(patient).dict()
        patient_data['today_flag'] = is_today_est(patient.next_med_count)
        result.append(patient_data)
    return result

@router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(dependencies.get_db)):
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_data = schemas.Patient.from_orm(db_patient).dict()
    patient_data['today_flag'] = is_today_est(db_patient.next_med_count)
    return patient_data

@router.get("/mri/{mri}")
def read_patient_by_mri(mri: str, db: Session = Depends(dependencies.get_db)):
    db_patient = crud.get_patient_by_mri(db, mri=mri)
    result = 2
    if db_patient is not None:
        result = 1 if is_today_est(db_patient.next_med_count) else 0
    return {"result": result}

@router.put("/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(dependencies.get_db)):
    db_patient = crud.update_patient(db, patient_id=patient_id, patient=patient)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_data = schemas.Patient.from_orm(db_patient).dict()
    patient_data['today_flag'] = is_today_est(db_patient.next_med_count)
    return patient_data

@router.delete("/{patient_id}", response_model=bool)
def delete_patient(patient_id: int, db: Session = Depends(dependencies.get_db)):
    success = crud.delete_patient(db, patient_id=patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return success