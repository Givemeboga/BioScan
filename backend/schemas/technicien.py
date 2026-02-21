from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TechnicienBase(BaseModel):
    nom: str
    departement: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    utilisateurId: Optional[int] = None


class TechnicienCreate(TechnicienBase):
    nom: str
    utilisateurId: int


class TechnicienUpdate(TechnicienBase):
    pass


class TechnicienRead(TechnicienBase):
    id: int
    bilansTraites: Optional[int] = 0
    analysesIA: Optional[int] = 0
    rapportsCrees: Optional[int] = 0
    status: Optional[str] = None
    dateInscription: Optional[datetime] = None
    derniereActivite: Optional[datetime] = None
    tempsTraitementMoyen: Optional[float] = None
    bilansEnAttente: Optional[int] = None

    class Config:
        orm_mode = True
