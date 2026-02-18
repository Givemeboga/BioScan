from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal

StatutDocument = Literal["BROUILLON", "EN_COURS", "TERMINE", "VALIDE"]


class BilanBiologiqueBase(BaseModel):
    type: Optional[str] = Field(None, max_length=100)
    nom_fichier: Optional[str] = None
    date_generation: Optional[datetime] = None
    statut: Optional[StatutDocument] = Field(default="BROUILLON")
    patient_id: Optional[int] = None
    technicien_id: Optional[int] = None


class BilanBiologiqueOut(BilanBiologiqueBase):
    bilan_id: int


class BilanBiologiqueList(BilanBiologiqueOut):
    patient_nom_complet: Optional[str] = None
    age: Optional[int] = None

    model_config = {"from_attributes": True}