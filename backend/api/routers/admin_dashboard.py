from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/stats", tags=["Admin Dashboard"])


def _role_counts(db: Session) -> dict:
    """Compte des utilisateurs par nom de rôle (clé = nom du rôle)."""
    rows = db.execute(text("""
        SELECT r.nom AS role, count(u.utilisateur_id) AS count
        FROM bioscan.utilisateur u
        LEFT JOIN bioscan.role r ON u.role_id = r.role_id
        GROUP BY r.nom
    """)).all()
    return {(r[0] or "Inconnu"): int(r[1]) for r in rows}


def _match_role(counts: dict, *needles: str) -> int:
    """Somme des comptes dont le nom de rôle contient l'un des mots-clés."""
    total = 0
    for name, n in counts.items():
        low = (name or "").lower()
        if any(k in low for k in needles):
            total += n
    return total


@router.get("/overview")
async def overview(db: Session = Depends(get_db)):
    total_users = db.execute(
        text("SELECT count(*) FROM bioscan.utilisateur")
    ).scalar() or 0
    active_accounts = db.execute(
        text("SELECT count(*) FROM bioscan.utilisateur WHERE statut::text = 'ACTIVE'")
    ).scalar() or 0
    rapports_generes = db.execute(
        text("SELECT count(*) FROM bioscan.rapport_medical")
    ).scalar() or 0
    total_bilans = db.execute(
        text("SELECT count(*) FROM bioscan.bilan_biologique")
    ).scalar() or 0
    total_evenements = db.execute(
        text("SELECT count(*) FROM bioscan.evenement_securite")
    ).scalar() or 0

    counts = _role_counts(db)
    return {
        "totalUsers": total_users,
        "activeAccounts": active_accounts,
        "inactiveAccounts": max(0, int(total_users) - int(active_accounts)),
        "rapportsGeneres": rapports_generes,
        "totalBilans": total_bilans,
        "totalEvenements": total_evenements,
        # Répartition par rôle (utilisée aussi pour les cartes par rôle)
        "patients": _match_role(counts, "patient"),
        "medecins": _match_role(counts, "medecin", "médecin"),
        "techniciens": _match_role(counts, "technicien"),
        "administrateurs": _match_role(counts, "admin"),
    }


@router.get("/roles-breakdown")
async def roles_breakdown(db: Session = Depends(get_db)):
    """Répartition des utilisateurs par rôle (pour le graphique en anneau)."""
    counts = _role_counts(db)
    return {"roles": [{"role": k, "count": v} for k, v in counts.items()]}


@router.get("/accounts-monthly")
async def accounts_monthly(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT date_trunc('month', date_generation) AS month,
               count(utilisateur_id)                AS count
        FROM bioscan.utilisateur
        WHERE date_generation IS NOT NULL
        GROUP BY 1
        ORDER BY 1
    """)).all()
    return {"monthly": [{"month": str(r[0]), "count": int(r[1])} for r in rows]}


@router.get("/account-status")
async def account_status(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT statut::text AS statut, count(utilisateur_id) AS count
        FROM bioscan.utilisateur
        GROUP BY statut
    """)).all()
    return {"statusBreakdown": {str(r[0]): int(r[1]) for r in rows}}


@router.get("/recent-activities")
async def recent_activities(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Get recent system activities from evenement_securite table"""
    try:
        query = """
            SELECT 
                es.evenement_id,
                es.utilisateur_id,
                u.nom_utilisateur,
                es.type_evenement,
                NOW(),
                u.role_id
            FROM bioscan.evenement_securite es
            JOIN bioscan.utilisateur u ON es.utilisateur_id = u.utilisateur_id
            ORDER BY es.evenement_id DESC
            LIMIT :limit
        """
        
        result = db.execute(text(query), {"limit": limit})
        rows = result.fetchall()
        
        activities = []
        for row in rows:
            evenement_id, user_id, nom_utilisateur, type_evenement, timestamp, role_id = row
            
            # Format the activity
            activities.append({
                "id": evenement_id,
                "user_id": user_id,
                "username": nom_utilisateur,
                "type": type_evenement or "Connexion",
                "timestamp": str(timestamp) if timestamp else None,
                "role_id": role_id
            })
        
        logger.info(f"Fetched {len(activities)} recent activities")
        return {"activities": activities}
    except Exception as e:
        logger.error(f"Error fetching recent activities: {e}")
        return {"activities": []}


