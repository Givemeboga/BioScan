import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/profil-medecin", tags=["Profil Medecin"])

BASE_DIR = Path(__file__).resolve().parents[2]
MEDIA_DIR = BASE_DIR / "media" / "profiles" / "medecins"


class MedecinProfileRead(BaseModel):
    medecin_id: int
    utilisateur_id: int
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    photo_url: Optional[str] = None
    specialite: Optional[str] = None
    matricule: Optional[str] = None
    statut: Optional[str] = None

    model_config = {"from_attributes": True}


class MedecinProfileUpdate(BaseModel):
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    specialite: Optional[str] = None
    matricule: Optional[str] = None

    model_config = {"from_attributes": True}


def _ensure_owner_or_admin(current_user: dict, owner_user_id: int) -> None:
    if current_user["role"] == "Admin":
        return
    if current_user["role"] == "Medecin" and current_user["user_id"] == owner_user_id:
        return
    raise HTTPException(status_code=403, detail="Accès refusé")


def _get_medecin_profile(db: Session, medecin_id: int):
    query = text(
        """
        SELECT
            m.medecin_id,
            u.utilisateur_id,
            u.nom_utilisateur,
            u.email,
            u.telephone,
            u.adresse,
            u.date_naissance,
            u.photo_url,
            m.specialite,
            m.matricule,
            u.statut
        FROM bioscan.medecin_biologiste m
        JOIN bioscan.utilisateur u ON u.utilisateur_id = m.utilisateur_id
        WHERE m.medecin_id = :medecin_id
        """
    )
    result = db.execute(query, {"medecin_id": medecin_id}).mappings().first()
    return result


@router.get("/{medecin_id}", response_model=MedecinProfileRead)
def get_medecin_profile(
    medecin_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_medecin_profile(db, medecin_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))
    return MedecinProfileRead(**dict(profile))


@router.put("/{medecin_id}", response_model=MedecinProfileRead)
def update_medecin_profile(
    medecin_id: int,
    payload: MedecinProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_medecin_profile(db, medecin_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))

    updates = []
    params = {"medecin_id": medecin_id, "utilisateur_id": int(profile["utilisateur_id"]) }

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
    if payload.specialite is not None:
        updates.append("specialite = :specialite")
        params["specialite"] = payload.specialite
    if payload.matricule is not None:
        updates.append("matricule = :matricule")
        params["matricule"] = payload.matricule

    if updates:
        db.execute(
            text(f"UPDATE bioscan.utilisateur SET {', '.join(updates)} WHERE utilisateur_id = :utilisateur_id"),
            params,
        )
        if payload.specialite is not None or payload.matricule is not None:
            med_updates = []
            med_params = {"medecin_id": medecin_id}
            if payload.specialite is not None:
                med_updates.append("specialite = :specialite")
                med_params["specialite"] = payload.specialite
            if payload.matricule is not None:
                med_updates.append("matricule = :matricule")
                med_params["matricule"] = payload.matricule
            if med_updates:
                db.execute(
                    text(f"UPDATE bioscan.medecin_biologiste SET {', '.join(med_updates)} WHERE medecin_id = :medecin_id"),
                    med_params,
                )
        db.commit()

    refreshed = _get_medecin_profile(db, medecin_id)
    logger.info("Updated medecin profile %s", medecin_id)
    return MedecinProfileRead(**dict(refreshed))


@router.post("/{medecin_id}/photo", response_model=MedecinProfileRead)
def upload_medecin_photo(
    medecin_id: int,
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_medecin_profile(db, medecin_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    _ensure_owner_or_admin(current_user, int(profile["utilisateur_id"]))

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"medecin_{medecin_id}_{photo.filename or 'photo'}"
    file_path = MEDIA_DIR / safe_name

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    photo_url = f"/media/profiles/medecins/{safe_name}"
    db.execute(
        text("UPDATE bioscan.utilisateur SET photo_url = :photo_url WHERE utilisateur_id = :utilisateur_id"),
        {"photo_url": photo_url, "utilisateur_id": int(profile["utilisateur_id"])},
    )
    db.commit()
    logger.info("Uploaded profile photo for medecin %s", medecin_id)

    refreshed = _get_medecin_profile(db, medecin_id)
    return MedecinProfileRead(**dict(refreshed))
