from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schemas.medecin import MedecinCreate, MedecinRead, MedecinUpdate
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/medecins", tags=["Admin Medecins"])


def _paginate_query_sql(limit: int, page: int) -> tuple:
    """Helper to calculate pagination offset and limit"""
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return offset, limit


@router.get("", response_model=List[MedecinRead])
async def list_medecins(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all doctors using raw SQL"""
    try:
        offset, limit = _paginate_query_sql(limit, page)
        
        where_clauses = []
        params = {}
        
        if search:
            where_clauses.append("(u.nom_utilisateur ILIKE :search OR u.email ILIKE :search)")
            params['search'] = f"%{search}%"
        
        if status:
            where_clauses.append("u.statut = :status")
            params['status'] = status
        
        # Filter by Medecin role
        where_clauses.append("r.nom = 'Medecin'")
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        query_str = f"""
            SELECT 
                u.utilisateur_id,
                u.nom_utilisateur,
                u.email,
                u.telephone,
                u.statut
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON u.role_id = r.role_id
            WHERE {where_clause}
            ORDER BY u.utilisateur_id DESC
            LIMIT :limit OFFSET :offset
        """
        
        params['limit'] = limit
        params['offset'] = offset
        
        result = db.execute(text(query_str), params)
        medecins_data = result.fetchall()
        
        result_list = []
        for medecin in medecins_data:
            result_list.append(MedecinRead(
                id=int(medecin[0]),
                nom=medecin[1],
                email=medecin[2],
                telephone=medecin[3],
                status=medecin[4],
            ))
        
        logger.info(f"Listed {len(result_list)} medecins")
        return result_list
        
    except Exception as e:
        logger.error(f"Error listing medecins: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{medecin_id}", response_model=MedecinRead)
async def get_medecin(medecin_id: int, db: Session = Depends(get_db)):
    """Get a specific doctor by ID"""
    try:
        result = db.execute(text("""
            SELECT 
                u.utilisateur_id,
                u.nom_utilisateur,
                u.email,
                u.telephone,
                u.statut
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON u.role_id = r.role_id
            WHERE u.utilisateur_id = :medecin_id AND r.nom = 'Medecin'
        """), {"medecin_id": medecin_id})
        
        medecin = result.fetchone()
        if not medecin:
            raise HTTPException(status_code=404, detail="Medecin not found")
        
        return MedecinRead(
            id=int(medecin[0]),
            nom=medecin[1],
            email=medecin[2],
            telephone=medecin[3],
            status=medecin[4],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting medecin {medecin_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
