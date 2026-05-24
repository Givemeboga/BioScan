import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/rapports-medicaux", tags=["Rapports Medicaux"])


class RapportMedicalRead(BaseModel):
    rapport_medical_id: int
    statut: Optional[str] = None
    date_generation: Optional[datetime] = None
    date_validation: Optional[datetime] = None
    bilan_id: Optional[int] = None
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    patient_nom_utilisateur: Optional[str] = None
    medecin_nom_utilisateur: Optional[str] = None

    model_config = {"from_attributes": True}


class RapportStatusUpdate(BaseModel):
    statut: str

    model_config = {"from_attributes": True}


def _get_patient_id(db: Session, user_id: int) -> Optional[int]:
    result = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :user_id"),
        {"user_id": user_id},
    ).mappings().first()
    return int(result["patient_id"]) if result else None


def _get_report(db: Session, rapport_id: int):
    query = text(
        """
        SELECT
            rm.rapport_medical_id,
            rm.statut,
            rm.date_generation,
            rm.date_validation,
            rm.bilan_id,
            rm.patient_id,
            rm.medecin_id,
            pu.nom_utilisateur AS patient_nom_utilisateur,
            mu.nom_utilisateur AS medecin_nom_utilisateur
        FROM bioscan.rapport_medical rm
        LEFT JOIN bioscan.patient p ON p.patient_id = rm.patient_id
        LEFT JOIN bioscan.utilisateur pu ON pu.utilisateur_id = p.utilisateur_id
        LEFT JOIN bioscan.medecin_biologiste m ON m.medecin_id = rm.medecin_id
        LEFT JOIN bioscan.utilisateur mu ON mu.utilisateur_id = m.utilisateur_id
        WHERE rm.rapport_medical_id = :rapport_id
        """
    )
    return db.execute(query, {"rapport_id": rapport_id}).mappings().first()


def _ensure_access(current_user: dict, report_row, db: Session) -> None:
    if current_user["role"] in {"Admin", "Medecin"}:
        return
    if current_user["role"] == "Patient":
        patient_id = _get_patient_id(db, current_user["user_id"])
        if patient_id and int(report_row["patient_id"] or 0) == patient_id:
            return
    raise HTTPException(status_code=403, detail="Accès refusé")


@router.get("", response_model=list[RapportMedicalRead])
def list_rapports(
    statut: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    params = {}
    where_clause = "WHERE 1 = 1"

    if current_user["role"] == "Patient":
        patient_id = _get_patient_id(db, current_user["user_id"])
        if not patient_id:
            return []
        where_clause += " AND rm.patient_id = :patient_id"
        params["patient_id"] = patient_id

    if statut:
        where_clause += " AND rm.statut = :statut"
        params["statut"] = statut

    query = text(
        f"""
        SELECT
            rm.rapport_medical_id,
            rm.statut,
            rm.date_generation,
            rm.date_validation,
            rm.bilan_id,
            rm.patient_id,
            rm.medecin_id,
            pu.nom_utilisateur AS patient_nom_utilisateur,
            mu.nom_utilisateur AS medecin_nom_utilisateur
        FROM bioscan.rapport_medical rm
        LEFT JOIN bioscan.patient p ON p.patient_id = rm.patient_id
        LEFT JOIN bioscan.utilisateur pu ON pu.utilisateur_id = p.utilisateur_id
        LEFT JOIN bioscan.medecin_biologiste m ON m.medecin_id = rm.medecin_id
        LEFT JOIN bioscan.utilisateur mu ON mu.utilisateur_id = m.utilisateur_id
        {where_clause}
        ORDER BY rm.date_generation DESC NULLS LAST
        """
    )
    rows = db.execute(query, params).mappings().all()
    return [RapportMedicalRead(**dict(row)) for row in rows]


@router.get("/{rapport_id}", response_model=RapportMedicalRead)
def get_rapport(
    rapport_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report_row = _get_report(db, rapport_id)
    if not report_row:
        raise HTTPException(status_code=404, detail="Rapport introuvable")

    _ensure_access(current_user, report_row, db)
    return RapportMedicalRead(**dict(report_row))


@router.patch("/{rapport_id}/validate", response_model=RapportMedicalRead)
def validate_rapport(
    rapport_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] not in {"Admin", "Medecin"}:
        raise HTTPException(status_code=403, detail="Accès refusé")

    report_row = _get_report(db, rapport_id)
    if not report_row:
        raise HTTPException(status_code=404, detail="Rapport introuvable")

    db.execute(
        text(
            """
            UPDATE bioscan.rapport_medical
            SET statut = 'VALIDE', date_validation = NOW()
            WHERE rapport_medical_id = :rapport_id
            """
        ),
        {"rapport_id": rapport_id},
    )
    db.commit()
    logger.info("Validated report %s", rapport_id)
    return get_rapport(rapport_id, current_user, db)


@router.patch("/{rapport_id}/reject", response_model=RapportMedicalRead)
def reject_rapport(
    rapport_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] not in {"Admin", "Medecin"}:
        raise HTTPException(status_code=403, detail="Accès refusé")

    report_row = _get_report(db, rapport_id)
    if not report_row:
        raise HTTPException(status_code=404, detail="Rapport introuvable")

    db.execute(
        text(
            """
            UPDATE bioscan.rapport_medical
            SET statut = 'REJETE', date_validation = NOW()
            WHERE rapport_medical_id = :rapport_id
            """
        ),
        {"rapport_id": rapport_id},
    )
    db.commit()
    logger.info("Rejected report %s", rapport_id)
    return get_rapport(rapport_id, current_user, db)
