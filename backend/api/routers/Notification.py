# backend/api/routers/notification.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.Notification import NotificationList, NotificationOut, NotificationCreate
from utils.security import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)


# ─────────────────────────────────────────────────────────────
# GET /api/notifications/patient/{user_id}
# ─────────────────────────────────────────────────────────────
@router.get("/patient/{user_id}", response_model=List[NotificationList])
def get_notifications_patient(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    statut: str = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    role      = (current_user.get("role") or "").strip().lower()
    # ✅ Utilise "user_id" (alias) qui est maintenant présent dans get_current_user
    caller_id = current_user.get("user_id")

    print(f"[DEBUG notifications] caller_id={caller_id} | role={role} | target user_id={user_id}")

    if role == "patient" and caller_id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    sql_str = """
        SELECT
            n.notification_id,
            n.titre,
            n.description,
            n.statut::text          AS statut,
            n.date_generation,
            n.date_mise_a_jour,
            n.utilisateur_id
        FROM notifications n
        WHERE n.utilisateur_id = :user_id
    """
    params: dict = {"user_id": user_id}

    if statut and statut.strip():
        sql_str += " AND n.statut::text = :statut"
        params["statut"] = statut.strip().upper()

    sql_str += " ORDER BY n.date_generation DESC NULLS LAST LIMIT :limit OFFSET :offset"
    params["limit"]  = limit
    params["offset"] = offset

    try:
        result = db.execute(text(sql_str), params)
        rows   = result.mappings().all()
        print(f"[DEBUG notifications] Trouvées: {len(rows)}")

        notifications = []
        for row in rows:
            row_dict = dict(row)
            row_dict["statut"] = (row_dict.get("statut") or "UNREAD").upper()
            row_dict["titre"]  = row_dict.get("titre") or "Notification"
            notifications.append(NotificationList(**row_dict))

        return notifications

    except Exception as e:
        print("=== ERREUR SQL notifications ===", str(e))
        return []


# ─────────────────────────────────────────────────────────────
# PUT /api/notifications/{id}/lire
# ─────────────────────────────────────────────────────────────
@router.put("/{notification_id}/lire", response_model=NotificationOut)
def marquer_comme_lu(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role      = (current_user.get("role") or "").strip().lower()
    caller_id = current_user.get("user_id")

    check = db.execute(
        text("SELECT notification_id, utilisateur_id FROM notifications WHERE notification_id = :id"),
        {"id": notification_id}
    ).mappings().first()

    if not check:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if role == "patient" and check["utilisateur_id"] != caller_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    try:
        result = db.execute(
            text("""
                UPDATE notifications
                SET statut = 'READ', date_mise_a_jour = NOW()
                WHERE notification_id = :id
                RETURNING
                    notification_id, titre, description,
                    statut::text AS statut,
                    date_generation, date_mise_a_jour, utilisateur_id
            """),
            {"id": notification_id}
        )
        db.commit()
        updated = result.mappings().first()
        return NotificationOut(**dict(updated))
    except Exception as e:
        db.rollback()
        print("=== ERREUR UPDATE notification ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")


# ─────────────────────────────────────────────────────────────
# PUT /api/notifications/patient/{user_id}/lire-tout
# ─────────────────────────────────────────────────────────────
@router.put("/patient/{user_id}/lire-tout")
def marquer_tout_comme_lu(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role      = (current_user.get("role") or "").strip().lower()
    caller_id = current_user.get("user_id")

    if role == "patient" and caller_id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    try:
        result = db.execute(
            text("""
                UPDATE notifications
                SET statut = 'READ', date_mise_a_jour = NOW()
                WHERE utilisateur_id = :user_id
                  AND statut::text = 'UNREAD'
            """),
            {"user_id": user_id}
        )
        db.commit()
        print(f"[DEBUG notifications] {result.rowcount} notif(s) marquée(s) lues pour user_id={user_id}")
        return {"message": f"{result.rowcount} notification(s) marquée(s) comme lue(s)"}
    except Exception as e:
        db.rollback()
        print("=== ERREUR UPDATE lire-tout ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")


# ─────────────────────────────────────────────────────────────
# DELETE /api/notifications/{id}
# ─────────────────────────────────────────────────────────────
@router.delete("/{notification_id}")
def supprimer_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role      = (current_user.get("role") or "").strip().lower()
    caller_id = current_user.get("user_id")

    check = db.execute(
        text("SELECT notification_id, utilisateur_id FROM notifications WHERE notification_id = :id"),
        {"id": notification_id}
    ).mappings().first()

    if not check:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    if role == "patient" and check["utilisateur_id"] != caller_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    try:
        db.execute(
            text("DELETE FROM notifications WHERE notification_id = :id"),
            {"id": notification_id}
        )
        db.commit()
        return {"message": "Notification supprimée avec succès"}
    except Exception as e:
        db.rollback()
        print("=== ERREUR DELETE notification ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# ─────────────────────────────────────────────────────────────
# POST /api/notifications/   (technicien / admin uniquement)
# ─────────────────────────────────────────────────────────────
@router.post("/", response_model=NotificationOut, status_code=201)
def creer_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = (current_user.get("role") or "").strip().lower()
    if role == "patient":
        raise HTTPException(
            status_code=403,
            detail="Les patients ne peuvent pas créer de notifications"
        )

    try:
        result = db.execute(
            text("""
                INSERT INTO notifications
                    (titre, description, statut, utilisateur_id, date_generation, date_mise_a_jour)
                VALUES
                    (:titre, :description, 'UNREAD', :utilisateur_id, NOW(), NOW())
                RETURNING
                    notification_id, titre, description,
                    statut::text AS statut,
                    date_generation, date_mise_a_jour, utilisateur_id
            """),
            {
                "titre":          payload.titre,
                "description":    payload.description,
                "utilisateur_id": payload.utilisateur_id,
            }
        )
        db.commit()
        created = result.mappings().first()
        return NotificationOut(**dict(created))
    except Exception as e:
        db.rollback()
        print("=== ERREUR INSERT notification ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la création")