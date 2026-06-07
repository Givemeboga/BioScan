from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/notifications", tags=["Admin Notifications"])


# Libellés lisibles pour les types d'événements de sécurité
_TYPE_LABELS = {
    "Creation_utilisateur": "Création d'un compte utilisateur",
    "Modification_utilisateur": "Modification d'un compte utilisateur",
    "Suppression_utilisateur": "Suppression d'un compte utilisateur",
    "Changement_statut": "Changement de statut d'un compte",
    "Reinitialisation_motdepasse": "Réinitialisation de mot de passe",
    "Connexion": "Connexion au système",
    "LOGIN": "Connexion au système",
    "LOGIN_FAILED": "Échec de connexion",
}


def _humanize(type_evenement: str) -> str:
    if not type_evenement:
        return "Événement système"
    return _TYPE_LABELS.get(type_evenement, type_evenement.replace("_", " ").capitalize())


def _severity(type_evenement: str, status_str: str) -> str:
    """info | warning | danger — utilisé côté frontend pour la couleur."""
    s = (status_str or "").upper()
    t = (type_evenement or "")
    if s and s != "SUCCESS":
        return "danger"
    if "Suppression" in t:
        return "danger"
    if "Changement_statut" in t or "Reinitialisation" in t or "Modification" in t:
        return "warning"
    return "info"


@router.get("")
async def list_notifications(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """
    Flux de notifications administrateur.
    Source : journal des événements de sécurité (bioscan.evenement_securite),
    enrichi avec l'utilisateur concerné. Requête SQL explicite sur le schéma
    `bioscan` (même approche que le dashboard admin).
    """
    try:
        rows = db.execute(
            text("""
                SELECT
                    es.evenement_id,
                    es.type_evenement,
                    es.status,
                    es.ip,
                    es.agent_utilisateur,
                    es.utilisateur_id,
                    u.nom_utilisateur,
                    u.email
                FROM bioscan.evenement_securite es
                LEFT JOIN bioscan.utilisateur u
                       ON es.utilisateur_id = u.utilisateur_id
                ORDER BY es.evenement_id DESC
                LIMIT :limit
            """),
            {"limit": limit},
        ).mappings().all()

        notifications = []
        for r in rows:
            type_evt = r["type_evenement"]
            status_str = r["status"]
            notifications.append({
                "id": r["evenement_id"],
                "type": type_evt,
                "title": _humanize(type_evt),
                "severity": _severity(type_evt, status_str),
                "status": status_str,
                "ip": r["ip"],
                "userAgent": r["agent_utilisateur"],
                "userId": r["utilisateur_id"],
                "username": r["nom_utilisateur"],
                "email": r["email"],
            })

        logger.info("Listed admin notifications", extra={"count": len(notifications)})
        return {"notifications": notifications, "count": len(notifications)}
    except Exception as exc:
        logger.exception("Failed to list admin notifications")
        return {"notifications": [], "count": 0}


@router.get("/count")
async def notifications_count(db: Session = Depends(get_db)):
    """Nombre total d'événements — utilisé pour le badge de la cloche."""
    try:
        total = db.execute(
            text("SELECT count(*) FROM bioscan.evenement_securite")
        ).scalar() or 0
        return {"count": int(total)}
    except Exception:
        logger.exception("Failed to count admin notifications")
        return {"count": 0}


@router.delete("/{evenement_id}", status_code=204)
async def delete_notification(evenement_id: int, db: Session = Depends(get_db)):
    """Supprime un événement du journal."""
    try:
        result = db.execute(
            text("DELETE FROM bioscan.evenement_securite WHERE evenement_id = :id"),
            {"id": evenement_id},
        )
        db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification introuvable")
        return
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("Failed to delete admin notification")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
