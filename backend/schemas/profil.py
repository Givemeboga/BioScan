# backend/schemas/profil.py

from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import datetime, date


# ══════════════════════════════════════════════════════════════
#  MÉDECIN
# ══════════════════════════════════════════════════════════════

class ProfilMedecinOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    utilisateur_id: int
    nom_utilisateur: str
    email: str
    mot_de_passe: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    statut: Optional[str] = "actif"
    date_generation: Optional[datetime] = None
    date_mise_a_jour: Optional[datetime] = None


class ProfilMedecinUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nom_utilisateur: Optional[str] = None
    mot_de_passe: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    statut: Optional[str] = None


# ══════════════════════════════════════════════════════════════
#  PATIENT
# ══════════════════════════════════════════════════════════════

class ProfilPatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    utilisateur_id: int
    nom_utilisateur: str
    email: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[date] = None
    statut: Optional[str] = "actif"
    date_generation: Optional[datetime] = None
    date_mise_a_jour: Optional[datetime] = None
    photo_url: Optional[str] = None


class ProfilPatientUpdate(BaseModel):
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[date] = None

    @field_validator("email")
    @classmethod
    def email_valide(cls, v):
        if v is not None:
            v = v.strip()
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Format d'email invalide.")
        return v

    @field_validator("nom_utilisateur")
    @classmethod
    def nom_non_vide(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Le nom ne peut pas être vide.")
        return v.strip() if v else v