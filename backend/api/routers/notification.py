from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from typing import List

from models.notification import Notification, StatutNotification
from schemas.notification import NotificationSchema

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

# 🔹 1️⃣ Récupérer toutes les notifications
@router.get("/", response_model=List[NotificationSchema])
def get_notifications(
    db: Session = Depends(get_db),
    statut: StatutNotification | None = Query(None, description="Filtrer par statut : UNREAD / READ")
):
    query = db.query(Notification)

    if statut:
        query = query.filter(Notification.statut == statut)

    notifications = query.order_by(Notification.date_generation.desc()).all()
    return notifications


# 🔹 2️⃣ Compter notifications non lues
@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.statut == StatutNotification.UNREAD).count()
    return {"count": count}


# 🔹 3️⃣ Marquer une notification comme lue
@router.put("/{id}/read")
def mark_as_read(id: int, db: Session = Depends(get_db)):

    notification = db.query(Notification).filter(Notification.notification_id == id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")

    notification.statut = StatutNotification.READ
    notification.date_mise_a_jour = datetime.utcnow()
    db.commit()

    return {"message": "Notification mise à jour"}


# 🔹 4️⃣ Marquer toutes les notifications comme lues
@router.put("/read-all")
def mark_all_as_read(db: Session = Depends(get_db)):
    updated = db.query(Notification).filter(Notification.statut == StatutNotification.UNREAD).update(
        {Notification.statut: StatutNotification.READ, Notification.date_mise_a_jour: datetime.utcnow()},
        synchronize_session=False
    )
    db.commit()
    return {"message": f"{updated} notifications mises à jour"}


# 🔹 5️⃣ Supprimer une notification
@router.delete("/{id}")
def delete_notification(id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.notification_id == id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")

    db.delete(notification)
    db.commit()
    return {"message": "Notification supprimée avec succès"}
