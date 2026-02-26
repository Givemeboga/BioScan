# backend/schemas/profil_medecin.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ProfilMedecinOut(BaseModel):
    utilisateur_id:  int
    nom_utilisateur: Optional[str]      = None
    email:           Optional[str]      = None
    telephone:       Optional[str]      = None
    statut:          Optional[str]      = None
    date_naissance:  Optional[datetime] = None
    date_generation: Optional[datetime] = None
    photo_url:       Optional[str]      = None   # URL publique /media/avatars/…
    role_id:         Optional[int]      = None

    model_config = {"from_attributes": True}


class ProfilMedecinUpdate(BaseModel):
    nom_utilisateur: Optional[str]      = None
    email:           Optional[EmailStr] = None
    telephone:       Optional[str]      = None
    statut:          Optional[str]      = None
    mot_de_passe:    Optional[str]      = None   # hashé côté router
    photo_url:       Optional[str]      = None