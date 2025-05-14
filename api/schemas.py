from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class PatientBase(BaseModel):
    mri: str = Field(..., min_length=2, max_length=6)
    next_med_count: date

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    today_flag: Optional[bool] = None  # This is now a computed field

    class Config:
        orm_mode = True
        from_attributes = True