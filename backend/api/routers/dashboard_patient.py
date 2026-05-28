# backend/api/routers/dashboard_patient.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from utils.security import get_current_user

router = APIRouter(
    prefix="/dashboard-patient",
    tags=["dashboard-patient"],
)


def _get_stats(db: Session, patient_id: int) -> dict:
    now = datetime.now()
    row = db.execute(text("""
        SELECT
            COUNT(*)                                                               AS total,
            COUNT(*) FILTER (WHERE statut = 'VALIDE')                             AS valides,
            COUNT(*) FILTER (WHERE statut IN ('EN_COURS','BROUILLON'))             AS en_attente,
            COUNT(*) FILTER (WHERE EXTRACT(YEAR  FROM date_generation) = :annee)  AS cette_annee,
            COUNT(*) FILTER (WHERE EXTRACT(YEAR  FROM date_generation) = :annee
                               AND EXTRACT(MONTH FROM date_generation) = :mois)   AS ce_mois
        FROM bioscan.bilan_biologique
        WHERE patient_id = :pid
    """), {"pid": patient_id, "annee": now.year, "mois": now.month}).mappings().first()

    return {
        "total":      int(row["total"])       if row else 0,
        "validés":    int(row["valides"])     if row else 0,
        "enAttente":  int(row["en_attente"])  if row else 0,
        "cetteAnnée": int(row["cette_annee"]) if row else 0,
        "ceMois":     int(row["ce_mois"])     if row else 0,
    }


def _get_bilans_recents(db: Session, patient_id: int) -> list:
    rows = db.execute(text("""
        SELECT bilan_id, type, statut, date_generation, nom_fichier
        FROM bioscan.bilan_biologique
        WHERE patient_id = :pid
        ORDER BY date_generation DESC NULLS LAST
        LIMIT 5
    """), {"pid": patient_id}).mappings().all()
    return [dict(r) for r in rows]


def _get_monthly(db: Session, patient_id: int) -> list:
    rows = db.execute(text("""
        SELECT
            TO_CHAR(date_generation, 'Mon YY') AS month,
            COUNT(*) AS count
        FROM bioscan.bilan_biologique
        WHERE patient_id = :pid
          AND date_generation >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(date_generation, 'Mon YY'), EXTRACT(YEAR FROM date_generation), EXTRACT(MONTH FROM date_generation)
        ORDER BY EXTRACT(YEAR FROM date_generation), EXTRACT(MONTH FROM date_generation)
    """), {"pid": patient_id}).mappings().all()
    return [{"month": r["month"], "count": int(r["count"])} for r in rows]


# ── GET /api/dashboard-patient/me ─────────────────────────────
@router.get("/me")
def get_dashboard_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("user_id") or current_user.get("utilisateur_id")

    patient = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :uid"),
        {"uid": user_id}
    ).mappings().first()

    if not patient:
        return {"stats": {}, "bilans_recents": [], "monthly": []}

    pid = patient["patient_id"]
    return {
        "stats":         _get_stats(db, pid),
        "bilans_recents": _get_bilans_recents(db, pid),
        "monthly":       _get_monthly(db, pid),
    }


# ── GET /api/dashboard-patient/{utilisateur_id} ───────────────
# Garde la compatibilité avec l'ancien appel frontend
@router.get("/{utilisateur_id}")
def get_dashboard_by_user(
    utilisateur_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    caller_id = current_user.get("user_id") or current_user.get("utilisateur_id")
    role      = (current_user.get("role") or "").strip().lower()

    # Un patient ne peut voir que son propre dashboard
    if role == "patient" and int(caller_id) != int(utilisateur_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    patient = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :uid"),
        {"uid": utilisateur_id}
    ).mappings().first()

    if not patient:
        return {"stats": {}, "bilans_recents": [], "monthly": []}

    pid = patient["patient_id"]
    return {
        "stats":          _get_stats(db, pid),
        "bilans_recents": _get_bilans_recents(db, pid),
        "monthly":        _get_monthly(db, pid),
    }