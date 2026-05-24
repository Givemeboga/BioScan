import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/profil-patient", tags=["Profil Patient"])

BASE_DIR = Path(__file__).resolve().parents[2]
MEDIA_DIR = BASE_DIR / "media" / "profiles" / "patients"


class PatientProfileRead(BaseModel):
    patient_id: int
    utilisateur_id: int
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    photo_url: Optional[str] = None
    statut: Optional[str] = None
    actif: Optional[bool] = None

    model_config = {"from_attributes": True}


class PatientProfileUpdate(BaseModel):
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None

    model_config = {"from_attributes": True}


def _ensure_owner_or_admin(current_user: dict, owner_user_id: int) -> None:
    if current_user["role"] == "Admin":
        return
    if current_user["role"] == "Patient" and current_user["user_id"] == owner_user_id:
        return
    raise HTTPException(status_code=403, detail="Accès refusé")


def _get_patient_profile(db: Session, patient_id: int):
    query = text(
        """
        SELECT
            p.patient_id,
            u.utilisateur_id,
            u.nom_utilisateur,
            u.email,
            u.telephone,
            u.adresse,
            u.date_naissance,
            u.photo_url,
            u.statut,
            p.actif
        FROM bioscan.patient p
        JOIN bioscan.utilisateur u ON u.utilisateur_id = p.utilisateur_id
        WHERE p.patient_id = :patient_id
        """
    )
    return db.execute(query, {"patient_id": patient_id}).mappings().first()


@router.get("/{patient_id}", response_model=PatientProfileRead)
def get_patient_profile(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_patient_profile(db, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))
    return PatientProfileRead(**dict(profile))


@router.put("/{patient_id}", response_model=PatientProfileRead)
def update_patient_profile(
    patient_id: int,
    payload: PatientProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_patient_profile(db, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))

    updates = []
    params = {"utilisateur_id": int(profile["utilisateur_id"])}

    if payload.nom_utilisateur is not None:
        updates.append("nom_utilisateur = :nom_utilisateur")
        params["nom_utilisateur"] = payload.nom_utilisateur
    if payload.email is not None:
        updates.append("email = :email")
        params["email"] = payload.email
    if payload.telephone is not None:
        updates.append("telephone = :telephone")
        params["telephone"] = payload.telephone
    if payload.adresse is not None:
        updates.append("adresse = :adresse")
        params["adresse"] = payload.adresse
    if payload.date_naissance is not None:
        updates.append("date_naissance = :date_naissance")
        params["date_naissance"] = payload.date_naissance

    if updates:
        db.execute(
            text(f"UPDATE bioscan.utilisateur SET {', '.join(updates)} WHERE utilisateur_id = :utilisateur_id"),
            params,
        )
        db.commit()

    refreshed = _get_patient_profile(db, patient_id)
    logger.info("Updated patient profile %s", patient_id)
    return PatientProfileRead(**dict(refreshed))


@router.post("/{patient_id}/photo", response_model=PatientProfileRead)
def upload_patient_photo(
    patient_id: int,
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_patient_profile(db, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"patient_{patient_id}_{photo.filename or 'photo'}"
    file_path = MEDIA_DIR / safe_name

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    photo_url = f"/media/profiles/patients/{safe_name}"
    db.execute(
        text("UPDATE bioscan.utilisateur SET photo_url = :photo_url WHERE utilisateur_id = :utilisateur_id"),
        {"photo_url": photo_url, "utilisateur_id": int(profile["utilisateur_id"])},
    )
    db.commit()
    logger.info("Uploaded profile photo for patient %s", patient_id)

    refreshed = _get_patient_profile(db, patient_id)
    return PatientProfileRead(**dict(refreshed))
