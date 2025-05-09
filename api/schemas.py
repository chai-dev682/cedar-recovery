from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PatientBase(BaseModel):
    ssn_last4: str = Field(..., min_length=4, max_length=4)
    mri: str = Field(..., min_length=4, max_length=4)
    next_med_count: date
    today_flag: bool = False

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True