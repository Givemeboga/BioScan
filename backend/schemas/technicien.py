from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TechnicienBase(BaseModel):
    nom: Optional[str] = None
    departement: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    utilisateurId: Optional[int] = None
    nom_utilisateur: Optional[str] = None
    password: Optional[str] = None
    photo_url: Optional[str] = None


class TechnicienCreate(TechnicienBase):
    email: Optional[EmailStr] = None
    utilisateurId: Optional[int] = None


class TechnicienUpdate(TechnicienBase):
    pass


class TechnicienRead(TechnicienBase):
    id: Optional[int] = None
    technicien_id: Optional[int] = None
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


class TechnicienResponse(BaseModel):
    technicien_id: int
    nom_utilisateur: str
    email: EmailStr
    telephone: Optional[str] = None
    matricule: Optional[str] = None
    photo_url: Optional[str] = None

    class Config:
        orm_mode = True


class PhotoResponse(BaseModel):
    message: str
    photo_url: str
