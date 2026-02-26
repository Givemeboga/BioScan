# backend/api/routers/notification.py

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

class NotificationOut(BaseModel):
    id: int
    utilisateur_id: int
    titre: Optional[str] = None
    statut_notification: Optional[str] = None
    date_generation: Optional[datetime] = None
    date_mise_a_jour: Optional[datetime] = None

    class Config:
        from_attributes = True


def get_caller_id(current_user: dict) -> int:
    uid = current_user.get("user_id") or current_user.get("utilisateur_id") or current_user.get("sub") or current_user.get("id")
    if not uid:
        raise HTTPException(status_code=401, detail="Utilisateur non identifié dans le token.")
    return int(uid)


def check_notification_owner(notif_id: int, user_id: int, db: Session):
    row = db.execute(
        text("SELECT utilisateur_id FROM notifications WHERE id = :nid"),
        {"nid": notif_id}
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if int(row["utilisateur_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")


@router.get("/me", response_model=List[NotificationOut])
async def get_my_notifications(
    statut: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    logger.info(f"GET /notifications/me - user={user_id} statut={statut}")

    query = """
        SELECT id, utilisateur_id, titre, statut_notification,
               date_generation, date_mise_a_jour
        FROM notifications
        WHERE utilisateur_id = :uid
    """
    params = {"uid": user_id}

    if statut:
        query += " AND statut_notification = :statut"
        params["statut"] = statut.upper()

    query += " ORDER BY date_generation DESC LIMIT :limit OFFSET :offset"
    params.update({"limit": limit, "offset": offset})

    rows = db.execute(text(query), params).mappings().all()
    return rows


@router.get("/me/count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    row = db.execute(
        text("SELECT COUNT(*) AS total FROM notifications WHERE utilisateur_id = :uid AND statut_notification = 'UNREAD'"),
        {"uid": user_id}
    ).mappings().first()
    return {"unread_count": int(row["total"]) if row else 0}


@router.put("/me/read-all")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    result = db.execute(
        text("""
            UPDATE notifications 
            SET statut_notification = 'READ', date_mise_a_jour = NOW()
            WHERE utilisateur_id = :uid AND statut_notification = 'UNREAD'
        """),
        {"uid": user_id}
    )
    db.commit()
    return {"detail": "Toutes les notifications marquées comme lues", "updated": result.rowcount}


@router.put("/{notif_id}/read")
async def mark_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    check_notification_owner(notif_id, user_id, db)
    db.execute(
        text("UPDATE notifications SET statut_notification='READ', date_mise_a_jour=NOW() WHERE id=:nid"),
        {"nid": notif_id}
    )
    db.commit()
    return {"detail": "Notification marquée comme lue"}


@router.delete("/{notif_id}")
async def delete_notification(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    check_notification_owner(notif_id, user_id, db)
    db.execute(text("DELETE FROM notifications WHERE id=:nid"), {"nid": notif_id})
    db.commit()
    return {"detail": "Notification supprimée"}