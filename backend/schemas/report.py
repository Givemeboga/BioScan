from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportBase(BaseModel):
    type: Optional[str]
    titre: Optional[str]
    medecinId: Optional[int]
    patientId: Optional[int]
    status: Optional[str]


class ReportCreate(ReportBase):
    type: str
    titre: str


class ReportRead(ReportBase):
    id: int
    dateCreation: Optional[datetime]
    dateValidation: Optional[datetime]

    class Config:
        orm_mode = True
