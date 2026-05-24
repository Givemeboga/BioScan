import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard/patient", tags=["Dashboard Patient"])


@router.get("/stats")
def patient_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "Patient" and current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Accès refusé")

    patient_row = db.execute(
        text("SELECT patient_id FROM bioscan.patient WHERE utilisateur_id = :user_id"),
        {"user_id": current_user["user_id"]},
    ).mappings().first()

    if not patient_row:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    patient_id = int(patient_row["patient_id"])
    stats = db.execute(
        text(
            """
            SELECT
                COUNT(*) AS total_bilans,
                COUNT(*) FILTER (WHERE statut = 'VALIDE') AS validated_bilans,
                COUNT(*) FILTER (WHERE statut IN ('BROUILLON', 'EN_COURS')) AS pending_bilans
            FROM bioscan.bilan_biologique
            WHERE patient_id = :patient_id
            """
        ),
        {"patient_id": patient_id},
    ).mappings().first()

    logger.info("Loaded patient dashboard stats for patient %s", patient_id)
    return {
        "patient_id": patient_id,
        "totalBilans": int(stats["total_bilans"] or 0),
        "validatedBilans": int(stats["validated_bilans"] or 0),
        "pendingBilans": int(stats["pending_bilans"] or 0),
    }
