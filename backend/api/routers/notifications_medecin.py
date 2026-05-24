import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/notifications/medecin", tags=["Notifications Medecin"])


class NotificationCreate(BaseModel):
    utilisateur_id: Optional[int] = None
    titre: str
    message: str
    statut_notification: Optional[str] = "NON_LUE"

    model_config = {"from_attributes": True}


class NotificationUpdate(BaseModel):
    titre: Optional[str] = None
    message: Optional[str] = None
    statut_notification: Optional[str] = None

    model_config = {"from_attributes": True}


class NotificationRead(BaseModel):
    id: int
    utilisateur_id: int
    titre: str
    message: str
    statut_notification: Optional[str] = None
    date_generation: Optional[datetime] = None

    model_config = {"from_attributes": True}


@router.get("", response_model=list[NotificationRead])
def list_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = current_user["user_id"]
    rows = db.execute(
        text(
            """
            SELECT id, utilisateur_id, titre, message, statut_notification, date_generation
            FROM bioscan.notification
            WHERE utilisateur_id = :utilisateur_id
            ORDER BY date_generation DESC NULLS LAST, id DESC
            """
        ),
        {"utilisateur_id": target_user_id},
    ).mappings().all()
    return [NotificationRead(**dict(row)) for row in rows]


@router.post("", response_model=NotificationRead)
def create_notification(
    payload: NotificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    utilisateur_id = payload.utilisateur_id or current_user["user_id"]
    result = db.execute(
        text(
            """
            INSERT INTO bioscan.notification
                (utilisateur_id, titre, message, statut_notification, date_generation)
            VALUES
                (:utilisateur_id, :titre, :message, :statut_notification, NOW())
            RETURNING id, utilisateur_id, titre, message, statut_notification, date_generation
            """
        ),
        {
            "utilisateur_id": utilisateur_id,
            "titre": payload.titre,
            "message": payload.message,
            "statut_notification": payload.statut_notification or "NON_LUE",
        },
    ).mappings().first()
    db.commit()
    logger.info("Created notification for user %s", utilisateur_id)
    return NotificationRead(**dict(result))


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text(
            """
            SELECT id, utilisateur_id, titre, message, statut_notification, date_generation
            FROM bioscan.notification
            WHERE id = :notification_id
            """
        ),
        {"notification_id": notification_id},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if current_user["role"] != "Admin" and int(row["utilisateur_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return NotificationRead(**dict(row))


@router.patch("/{notification_id}", response_model=NotificationRead)
def update_notification(
    notification_id: int,
    payload: NotificationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text(
            """
            SELECT id, utilisateur_id, titre, message, statut_notification, date_generation
            FROM bioscan.notification
            WHERE id = :notification_id
            """
        ),
        {"notification_id": notification_id},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if current_user["role"] != "Admin" and int(row["utilisateur_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    updates = []
    params = {"notification_id": notification_id}

    if payload.titre is not None:
        updates.append("titre = :titre")
        params["titre"] = payload.titre
    if payload.message is not None:
        updates.append("message = :message")
        params["message"] = payload.message
    if payload.statut_notification is not None:
        updates.append("statut_notification = :statut_notification")
        params["statut_notification"] = payload.statut_notification

    if updates:
        db.execute(
            text(f"UPDATE bioscan.notification SET {', '.join(updates)} WHERE id = :notification_id"),
            params,
        )
        db.commit()

    refreshed = db.execute(
        text(
            """
            SELECT id, utilisateur_id, titre, message, statut_notification, date_generation
            FROM bioscan.notification
            WHERE id = :notification_id
            """
        ),
        {"notification_id": notification_id},
    ).mappings().first()
    logger.info("Updated notification %s", notification_id)
    return NotificationRead(**dict(refreshed))


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text("SELECT id, utilisateur_id FROM bioscan.notification WHERE id = :notification_id"),
        {"notification_id": notification_id},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if current_user["role"] != "Admin" and int(row["utilisateur_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    db.execute(text("DELETE FROM bioscan.notification WHERE id = :notification_id"), {"notification_id": notification_id})
    db.commit()
    logger.info("Deleted notification %s", notification_id)
    return {"message": "Notification supprimée"}
