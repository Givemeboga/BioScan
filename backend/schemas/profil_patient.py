# schemas/profil_patient.py
from pydantic import BaseModel
from typing import Optional


class ProfilPatientOut(BaseModel):
    utilisateur_id:  Optional[int] = None
    patient_id:      Optional[int] = None
    nom_utilisateur: Optional[str] = None
    email:           Optional[str] = None
    telephone:       Optional[str] = None
    adresse:         Optional[str] = None
    date_naissance:  Optional[str] = None  # format YYYY-MM-DD
    photo_url:       Optional[str] = None

    model_config = {"from_attributes": True}