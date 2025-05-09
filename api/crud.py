from sqlalchemy.orm import Session
from . import models, schemas

def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_ssn(db: Session, ssn_last4: str):
    return db.query(models.Patient).filter(models.Patient.ssn_last4 == ssn_last4).first()

def get_patient_by_mri(db: Session, mri: str):
    return db.query(models.Patient).filter(models.Patient.mri == mri).first()

def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Patient).offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = models.Patient(
        ssn_last4=patient.ssn_last4,
        mri=patient.mri,
        next_med_count=patient.next_med_count,
        today_flag=patient.today_flag
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, patient: schemas.PatientCreate):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        for key, value in patient.dict().items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
        return True
    return False