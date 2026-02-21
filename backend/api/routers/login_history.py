from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models.utilisateur import Utilisateur
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/users", tags=["Login History"])


@router.get("/{user_id}/login-history", response_model=dict)
async def get_user_login_history(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get login history for a user from evenement_securite table"""
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Query from evenement_securite table
    query = """
        SELECT 
            evenement_id,
            ip,
            agent_utilisateur,
            status,
            type_evenement
        FROM bioscan.evenement_securite
        WHERE utilisateur_id = :user_id
        ORDER BY evenement_id DESC
        LIMIT :limit
    """
    
    result = db.execute(text(query), {"user_id": user_id, "limit": limit})
    rows = result.fetchall()
    
    history = []
    for row in rows:
        history.append({
            "ip": row[1],
            "user_agent": row[2],
            "status": row[3],
            "type": row[4]
        })
    
    logger.info("Fetched login history", extra={"user_id": user_id, "count": len(history)})
    return {
        "user_id": user_id,
        "user_name": user.nom_utilisateur,
        "history": history
    }
