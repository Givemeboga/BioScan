# backend/api/routers/bilan_biologique.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_db
from utils.security import get_current_user
from schemas.bilan import BilanBiologiqueList, BilanDashboardStats

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/bilans-biologiques",
    tags=["bilans-biologiques"],
)

# ─── SQL de base commun ───────────────────────────────────────────────────────
BASE_SELECT = """
    SELECT
        bb.bilan_id,
        bb.type,
        bb.statut,
        bb.date_generation,
        bb.nom_fichier,
        bb.patient_id,
        bb.technicien_id,
        bb.medecin_id,
        COALESCE(u.nom_utilisateur, '—') AS patient_nom_complet,
        CASE
            WHEN u.date_naissance IS NOT NULL
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_naissance))::integer
            ELSE NULL
        END AS age
    FROM bioscan.bilan_biologique bb
    LEFT JOIN bioscan.patient     p ON bb.patient_id    = p.patient_id
    LEFT JOIN bioscan.utilisateur u ON p.utilisateur_id = u.utilisateur_id
"""

ORDER_CLAUSE = " ORDER BY bb.date_generation DESC NULLS LAST LIMIT :limit OFFSET :offset"


# ─── Helpers ──────────────────────────────────────────────────────────────────
def row_to_bilan(row: dict) -> BilanBiologiqueList:
    d = dict(row)
    d["patient_nom_complet"] = d.get("patient_nom_complet") or "—"
    d["type"] = d.get("type") or "—"
    d["statut"] = d.get("statut") or "BROUILLON"
    d["age"] = int(d["age"]) if d.get("age") is not None else None
    d["date_generation"] = (
        d["date_generation"].isoformat() if d.get("date_generation") else None
    )
    return BilanBiologiqueList(**d)


def execute_bilans(db: Session, sql: str, params: dict) -> List[BilanBiologiqueList]:
    try:
        rows = db.execute(text(sql), params).mappings().all()
        return [row_to_bilan(row) for row in rows]
    except Exception as e:
        logger.exception("Erreur lors de la lecture des bilans")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des bilans"
        )


def get_patient_id(db: Session, utilisateur_id: int) -> int:
    """Récupère patient_id depuis utilisateur_id ou lève 404"""
    row = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :uid"),
        {"uid": utilisateur_id}
    ).mappings().first()

    if not row or not row["patient_id"]:
        raise HTTPException(
            status_code=404,
            detail="Aucun profil patient associé à ce compte. Veuillez compléter votre profil."
        )

    return row["patient_id"]


# ─── Route patient : MES bilans ───────────────────────────────────────────────
@router.get("/", response_model=List[BilanBiologiqueList])
def get_mes_bilans(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user),
        search: Optional[str] = Query(None, description="Recherche par nom ou type"),
        statut: Optional[str] = Query(None, description="Filtre par statut (VALIDE, EN_COURS, BROUILLON...)"),
        date_debut: Optional[datetime] = Query(None),
        date_fin: Optional[datetime] = Query(None),
        limit: int = Query(50, ge=1, le=500, description="Nombre max de résultats"),
        offset: int = Query(0, ge=0, description="Décalage pour pagination"),
):
    """Retourne uniquement les bilans du patient connecté."""
    user_id = current_user.get("utilisateur_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(401, "Utilisateur non identifié dans le token")

    patient_id = get_patient_id(db, int(user_id))

    logger.debug("[GET /bilans-biologiques/] → patient_id=%d | user_id=%d", patient_id, user_id)

    sql = BASE_SELECT + " WHERE bb.patient_id = :patient_id"
    params = {"patient_id": patient_id, "limit": limit, "offset": offset}

    if search and search.strip():
        sql += " AND (u.nom_utilisateur ILIKE :search OR bb.type ILIKE :search)"
        params["search"] = f"%{search.strip()}%"

    if statut:
        sql += " AND bb.statut = :statut"
        params["statut"] = statut.upper()

    if date_debut:
        sql += " AND bb.date_generation >= :date_debut"
        params["date_debut"] = date_debut

    if date_fin:
        sql += " AND bb.date_generation <= :date_fin"
        params["date_fin"] = date_fin

    return execute_bilans(db, sql + ORDER_CLAUSE, params)


# ─── Route médecin/admin : TOUS les bilans ────────────────────────────────────
@router.get("/all", response_model=List[BilanBiologiqueList])
def get_all_bilans(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user),
        search: Optional[str] = Query(None),
        statut: Optional[str] = Query(None),
        date_debut: Optional[datetime] = Query(None),
        date_fin: Optional[datetime] = Query(None),
        limit: int = Query(50, ge=1, le=500),
        offset: int = Query(0, ge=0),
):
    """Liste tous les bilans – réservé aux médecins et admins."""
    role = (current_user.get("role") or "").strip().lower()
    if role not in ("medecin", "admin"):
        raise HTTPException(status_code=403, detail="Accès réservé aux médecins et administrateurs")

    logger.debug("[GET /bilans-biologiques/all] → rôle=%s", role)

    sql = BASE_SELECT + " WHERE 1=1"
    params = {"limit": limit, "offset": offset}

    if search and search.strip():
        sql += " AND (u.nom_utilisateur ILIKE :search OR bb.type ILIKE :search)"
        params["search"] = f"%{search.strip()}%"

    if statut:
        sql += " AND bb.statut = :statut"
        params["statut"] = statut.upper()

    if date_debut:
        sql += " AND bb.date_generation >= :date_debut"
        params["date_debut"] = date_debut

    if date_fin:
        sql += " AND bb.date_generation <= :date_fin"
        params["date_fin"] = date_fin

    return execute_bilans(db, sql + ORDER_CLAUSE, params)


# ─── Statistiques dashboard pour le patient connecté ─────────────────────────
@router.get("/dashboard-stats", response_model=BilanDashboardStats)
def get_dashboard_stats(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user),
):
    """Statistiques des bilans du patient connecté uniquement."""
    user_id = current_user.get("utilisateur_id") or current_user.get("sub")
    if not user_id:
        raise HTTPException(401, "Utilisateur non identifié")

    patient_id = get_patient_id(db, int(user_id))

    now = datetime.utcnow()
    try:
        stats = db.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE statut = 'VALIDE') AS validés,
                    COUNT(*) FILTER (WHERE statut IN ('EN_COURS', 'BROUILLON')) AS en_attente,
                    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM date_generation) = :annee) AS cette_annee,
                    COUNT(*) FILTER (
                        WHERE EXTRACT(YEAR FROM date_generation) = :annee
                          AND EXTRACT(MONTH FROM date_generation) = :mois
                    ) AS ce_mois
                FROM bioscan.bilan_biologique
                WHERE patient_id = :patient_id
            """),
            {
                "patient_id": patient_id,
                "annee": now.year,
                "mois": now.month
            }
        ).mappings().one()

        return BilanDashboardStats(
            total=stats["total"] or 0,
            validés=stats["validés"] or 0,
            enAttente=stats["en_attente"] or 0,
            cetteAnnée=stats["cette_annee"] or 0,
            ceMois=stats["ce_mois"] or 0,
        )

    except Exception as e:
        logger.exception("Erreur stats dashboard patient %d", patient_id)
        raise HTTPException(500, "Erreur lors du calcul des statistiques")