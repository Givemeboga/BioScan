from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class MedecinBase(BaseModel):
    nom: str
    specialite: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    utilisateurId: Optional[int] = None


class MedecinCreate(MedecinBase):
    nom: str
    utilisateurId: int


class MedecinUpdate(MedecinBase):
    pass


class MedecinRead(MedecinBase):
    id: int
    rapportsValides: Optional[int] = 0
    status: Optional[str] = None
    dateInscription: Optional[datetime] = None
    derniereActivite: Optional[datetime] = None

    model_config = {"from_attributes": True}
