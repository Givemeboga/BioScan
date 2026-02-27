# schemas/parametres.py
from pydantic import BaseModel
from typing import Optional


class ParametresOut(BaseModel):
    utilisateur_id:  Optional[int]  = None
    patient_id:      Optional[int]  = None
    nom_utilisateur: Optional[str]  = None
    email:           Optional[str]  = None
    telephone:       Optional[str]  = None
    adresse:         Optional[str]  = None
    notifications:   Optional[bool] = True
    newsletter:      Optional[bool] = False

    model_config = {"from_attributes": True}


class ParametresUpdate(BaseModel):
    nom_utilisateur: Optional[str]  = None
    email:           Optional[str]  = None
    telephone:       Optional[str]  = None
    adresse:         Optional[str]  = None
    notifications:   Optional[bool] = None
    newsletter:      Optional[bool] = None


class PasswordChange(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str