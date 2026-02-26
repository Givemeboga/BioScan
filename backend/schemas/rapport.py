# backend/schemas/rapport.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RapportMedicalList(BaseModel):
    rapport_medical_id: int
    statut:             Optional[str]      = "BROUILLON"
    date_generation:    Optional[datetime] = None
    date_validation:    Optional[datetime] = None
    bilan_id:           Optional[int]      = None
    patient_id:         Optional[int]      = None
    medecin_id:         Optional[int]      = None
    patient_nom_complet: Optional[str]     = None
    age:                Optional[int]      = None
    bilan_type:         Optional[str]      = None
    bilan_nom_fichier:  Optional[str]      = None

    model_config = {"from_attributes": True}