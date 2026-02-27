# backend/api/routers/notifications_medecin.py

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
    tags=["Notifications Médecin"],
)


# ── Schémas ───────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    utilisateur_id: int
    titre: Optional[str] = None
    statut_notification: Optional[str] = None
    date_generation: Optional[datetime] = None
    date_mise_a_jour: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────
def get_caller_id(current_user: dict) -> int:
    """Extrait l'user_id depuis le token JWT quel que soit le champ utilisé."""
    uid = (
        current_user.get("user_id")
        or current_user.get("utilisateur_id")
        or current_user.get("id")
        or current_user.get("sub")
    )
    if not uid:
        logger.error("[get_caller_id] Aucun identifiant trouvé dans le token: %s", current_user)
        raise HTTPException(status_code=401, detail="Utilisateur non identifié dans le token.")
    try:
        return int(uid)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail=f"user_id invalide: {uid}")


def check_notification_owner(notif_id: int, user_id: int, db: Session):
    """Vérifie que la notification appartient bien à l'utilisateur."""
    row = db.execute(
        text("SELECT utilisateur_id FROM notifications WHERE id = :nid"),
        {"nid": notif_id}
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if int(row["utilisateur_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé à cette notification")


# ── Routes ───────────────────────────────────────────────────

@router.get("/me", response_model=List[NotificationOut])
async def get_my_notifications(
    statut: Optional[str] = Query(None, description="Filtrer par statut: UNREAD | READ"),
    limit:  int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    logger.info("[GET /notifications/me] user=%s statut=%s limit=%s offset=%s", user_id, statut, limit, offset)

    try:
        query = """
            SELECT id, utilisateur_id, titre, statut_notification,
                   date_generation, date_mise_a_jour
            FROM notifications
            WHERE utilisateur_id = :uid
        """
        params: dict = {"uid": user_id}

        if statut:
            query += " AND statut_notification = :statut"
            params["statut"] = statut.strip().upper()

        query += " ORDER BY date_generation DESC LIMIT :limit OFFSET :offset"
        params.update({"limit": limit, "offset": offset})

        rows = db.execute(text(query), params).mappings().all()
        return [dict(r) for r in rows]

    except HTTPException:
        raise
    except Exception as e:
        logger.error("[GET /notifications/me] CRASH: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur récupération notifications : {e}")


@router.get("/me/count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    logger.info("[GET /notifications/me/count] user=%s", user_id)

    try:
        row = db.execute(
            text("""
                SELECT COUNT(*) AS total
                FROM notifications
                WHERE utilisateur_id = :uid
                  AND statut_notification = 'UNREAD'
            """),
            {"uid": user_id}
        ).mappings().first()
        return {"unread_count": int(row["total"]) if row else 0}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("[GET /notifications/me/count] CRASH: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur comptage notifications : {e}")


@router.put("/me/read-all")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    logger.info("[PUT /notifications/me/read-all] user=%s", user_id)

    try:
        result = db.execute(
            text("""
                UPDATE notifications
                SET statut_notification = 'READ',
                    date_mise_a_jour    = NOW()
                WHERE utilisateur_id      = :uid
                  AND statut_notification = 'UNREAD'
            """),
            {"uid": user_id}
        )
        db.commit()
        return {
            "detail":  "Toutes les notifications marquées comme lues",
            "updated": result.rowcount,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("[PUT /notifications/me/read-all] CRASH: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur mise à jour : {e}")


@router.put("/{notif_id}/read")
async def mark_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    check_notification_owner(notif_id, user_id, db)
    logger.info("[PUT /notifications/%s/read] user=%s", notif_id, user_id)

    try:
        db.execute(
            text("""
                UPDATE notifications
                SET statut_notification = 'READ',
                    date_mise_a_jour    = NOW()
                WHERE id = :nid
            """),
            {"nid": notif_id}
        )
        db.commit()
        return {"detail": "Notification marquée comme lue"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("[PUT /notifications/%s/read] CRASH: %s", notif_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur mise à jour : {e}")


@router.delete("/{notif_id}")
async def delete_notification(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_caller_id(current_user)
    check_notification_owner(notif_id, user_id, db)
    logger.info("[DELETE /notifications/%s] user=%s", notif_id, user_id)

    try:
        db.execute(text("DELETE FROM notifications WHERE id = :nid"), {"nid": notif_id})
        db.commit()
        return {"detail": "Notification supprimée"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("[DELETE /notifications/%s] CRASH: %s", notif_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur suppression : {e}")


# ── Debug (à retirer en production) ──────────────────────────
@router.get("/debug/me")
async def debug_me(current_user: dict = Depends(get_current_user)):
    """Affiche le contenu du token décodé pour diagnostiquer les problèmes d'auth."""
    return {"token_payload": current_user}