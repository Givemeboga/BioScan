from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/stats", tags=["Admin Dashboard"])


@router.get("/overview")
async def overview(db: Session = Depends(get_db)):
    total_users = db.execute(
        text("SELECT count(*) FROM bioscan.utilisateur")
    ).scalar() or 0
    active_accounts = db.execute(
        text("SELECT count(*) FROM bioscan.utilisateur WHERE statut::text = 'ACTIVE'")
    ).scalar() or 0
    signalements = 0
    rapports_generes = db.execute(
        text("SELECT count(*) FROM bioscan.rapport_medical")
    ).scalar() or 0
    return {
        "totalUsers": total_users,
        "activeAccounts": active_accounts,
        "signalements": signalements,
        "rapportsGeneres": rapports_generes,
    }


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


