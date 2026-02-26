# backend/schemas/bilan.py

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


# ══════════════════════════════════════════════════════════════
#  LISTE (GET /)  —  utilisé par get_bilans_biologiques
#                    et get_bilans_par_medecin
# ══════════════════════════════════════════════════════════════

class BilanBiologiqueList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bilan_id: int
    type: Optional[str] = "—"
    statut: Optional[str] = "BROUILLON"
    date_generation: Optional[datetime] = None
    nom_fichier: Optional[str] = None

    # Clés étrangères
    patient_id: Optional[int] = None
    technicien_id: Optional[int] = None
    medecin_id: Optional[int] = None

    # Champs calculés / jointure
    patient_nom_complet: Optional[str] = "—"
    age: Optional[int] = None


# ══════════════════════════════════════════════════════════════
#  STATS DASHBOARD  —  utilisé par get_dashboard_stats
# ══════════════════════════════════════════════════════════════

class BilanDashboardStats(BaseModel):
    total: int = 0
    validés: int = 0
    enAttente: int = 0
    cetteAnnée: int = 0
    ceMois: int = 0


# ══════════════════════════════════════════════════════════════
#  DÉTAIL (GET /{bilan_id})  —  pour une future route détail
# ══════════════════════════════════════════════════════════════

class BilanBiologiqueDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bilan_id: int
    type: Optional[str] = "—"
    statut: Optional[str] = "BROUILLON"
    date_generation: Optional[datetime] = None
    nom_fichier: Optional[str] = None

    patient_id: Optional[int] = None
    technicien_id: Optional[int] = None
    medecin_id: Optional[int] = None

    patient_nom_complet: Optional[str] = "—"
    age: Optional[int] = None


# ══════════════════════════════════════════════════════════════
#  CRÉATION (POST)  —  pour une future route création
# ══════════════════════════════════════════════════════════════

class BilanBiologiqueCreate(BaseModel):
    type: str
    patient_id: int
    technicien_id: Optional[int] = None
    medecin_id: Optional[int] = None
    nom_fichier: Optional[str] = None
    statut: Optional[str] = "BROUILLON"


# ══════════════════════════════════════════════════════════════
#  MISE À JOUR (PUT)  —  pour une future route modification
# ══════════════════════════════════════════════════════════════

class BilanBiologiqueUpdate(BaseModel):
    type: Optional[str] = None
    statut: Optional[str] = None
    nom_fichier: Optional[str] = None
    technicien_id: Optional[int] = None
    medecin_id: Optional[int] = None


# ══════════════════════════════════════════════════════════════
#  ALIAS  —  compatibilité avec schemas/__init__.py
# ══════════════════════════════════════════════════════════════

# Si ton __init__.py importe BilanBiologiqueOut, cet alias évite l'erreur
BilanBiologiqueOut = BilanBiologiqueDetail