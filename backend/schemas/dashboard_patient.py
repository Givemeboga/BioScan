# backend/schemas/dashboard_patient.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardStatsPatient(BaseModel):
    total:      int = 0
    validés:    int = 0
    enAttente:  int = 0
    cetteAnnée: int = 0
    ceMois:     int = 0


class BilanRecent(BaseModel):
    bilan_id:        int
    type:            Optional[str] = "Bilan biologique"
    statut:          Optional[str] = "—"
    date_generation: Optional[datetime] = None
    nom_fichier:     Optional[str] = None


class MonthlyCount(BaseModel):
    month: str
    count: int


class DashboardPatientOut(BaseModel):
    stats:          DashboardStatsPatient
    bilans_recents: List[BilanRecent]
    monthly:        List[MonthlyCount]