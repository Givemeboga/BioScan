# backend/api/routers/rapport_medical.py
import os
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.rapport import RapportMedicalList
from utils.security import get_current_user  # ✅ correction import

router = APIRouter(
    prefix="/rapports-medicaux",
    tags=["rapports-medicaux"]
)


@router.get("/", response_model=List[RapportMedicalList])
def get_rapports(
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user),
        statut: str = Query(None),
        limit: int = Query(50, ge=1, le=500),
        offset: int = Query(0, ge=0)
):
    user_id = current_user.get("user_id")
    role = (current_user.get("role") or "").strip().lower()

    print(f"[DEBUG rapport] user_id={user_id} | role='{role}'")

    sql_str = """
        SELECT
            r.rapport_medical_id,
            r.statut,
            r.date_generation,
            r.date_validation,
            r.bilan_id,
            r.patient_id,
            r.medecin_id,
            COALESCE(u.nom_utilisateur, 'Aucun patient associé') AS patient_nom_complet,
            CASE
                WHEN u.date_naissance IS NOT NULL
                THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_naissance))::integer
                ELSE NULL
            END AS age,
            bb.type        AS bilan_type,
            bb.nom_fichier AS bilan_nom_fichier
        FROM bioscan.rapport_medical r
        INNER JOIN bioscan.patient          p  ON r.patient_id  = p.patient_id
        INNER JOIN bioscan.utilisateur      u  ON p.utilisateur_id = u.utilisateur_id
        LEFT  JOIN bioscan.bilan_biologique bb ON r.bilan_id    = bb.bilan_id
    """

    params = {}
    conditions = []

    # 🔒 Patient → uniquement SES rapports
    if role == "patient":
        conditions.append("p.utilisateur_id = :user_id")
        params["user_id"] = user_id

    if statut and statut.strip():
        conditions.append("r.statut = :statut")
        params["statut"] = statut.strip().upper()

    if conditions:
        sql_str += " WHERE " + " AND ".join(conditions)

    sql_str += """
        ORDER BY r.date_generation DESC NULLS LAST
        LIMIT :limit OFFSET :offset
    """
    params["limit"] = limit
    params["offset"] = offset

    print(f"[DEBUG rapport] SQL params: {params}")

    try:
        rows = db.execute(text(sql_str), params).mappings().all()
        print(f"[DEBUG rapport] Rapports trouvés : {len(rows)}")

        rapports = []
        for row in rows:
            d = dict(row)
            d["patient_nom_complet"] = d.get("patient_nom_complet") or "—"
            d["statut"]              = d.get("statut") or "BROUILLON"
            d["age"]                 = int(d["age"]) if d.get("age") is not None else None
            rapports.append(RapportMedicalList(**d))

        return rapports

    except Exception as e:
        print("=== ERREUR SQL rapport ===", str(e))
        return []


@router.get("/download/{nom_fichier}")
def download_rapport(
        nom_fichier: str,
        current_user: dict = Depends(get_current_user)
):
    file_path = os.path.join("uploads", "rapports", nom_fichier)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=nom_fichier
    )