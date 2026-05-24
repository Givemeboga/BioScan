import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models.utilisateur import pwd_context
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/parametres", tags=["Parametres"])


class ParametresRead(BaseModel):
    utilisateur_id: int
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    photo_url: Optional[str] = None
    statut: Optional[str] = None
    role_id: Optional[int] = None

    model_config = {"from_attributes": True}


class ParametresUpdate(BaseModel):
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[datetime] = None
    photo_url: Optional[str] = None
    mot_de_passe: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/me", response_model=ParametresRead)
def get_my_settings(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text(
            """
            SELECT utilisateur_id, nom_utilisateur, email, telephone, adresse, date_naissance, photo_url, statut, role_id
            FROM bioscan.utilisateur
            WHERE utilisateur_id = :user_id
            """
        ),
        {"user_id": current_user["user_id"]},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return ParametresRead(**dict(row))


@router.put("/me", response_model=ParametresRead)
def update_my_settings(
    payload: ParametresUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = []
    params = {"user_id": current_user["user_id"]}

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
    if payload.photo_url is not None:
        updates.append("photo_url = :photo_url")
        params["photo_url"] = payload.photo_url
    if payload.mot_de_passe:
        updates.append("mot_de_passe = :mot_de_passe")
        params["mot_de_passe"] = pwd_context.hash(payload.mot_de_passe)

    if not updates:
        return get_my_settings(current_user, db)

    db.execute(
        text(f"UPDATE bioscan.utilisateur SET {', '.join(updates)} WHERE utilisateur_id = :user_id"),
        params,
    )
    db.commit()
    logger.info("Updated settings for user %s", current_user["user_id"])
    return get_my_settings(current_user, db)
