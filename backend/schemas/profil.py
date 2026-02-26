from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Modèle pour la sortie (GET)
class ProfilMedecinOut(BaseModel):
    utilisateur_id: int
    nom_utilisateur: str
    email: str
    mot_de_passe: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    statut: str
    date_generation: datetime
    date_mise_a_jour: datetime

    model_config = {"from_attributes": True}

# Modèle pour la modification (PUT)
class ProfilMedecinUpdate(BaseModel):
    nom_utilisateur: Optional[str] = None
    mot_de_passe: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    statut: Optional[str] = None

    model_config = {"from_attributes": True}
