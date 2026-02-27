from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schemas.user import UserRead
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"])


def _paginate_query_sql(limit: int, page: int) -> tuple:
    """Helper to calculate pagination offset and limit"""
    if page < 1:
        page = 1
    offset = (page -1) * limit
    return offset, limit


@router.get("", response_model=List[UserRead])
async def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all users with optional filtering and pagination"""
    try:
        offset, limit = _paginate_query_sql(limit, page)
        
        # Build raw SQL query
        where_clauses = []
        params = {}
        
        if search:
            where_clauses.append("(u.nom_utilisateur ILIKE :search OR u.email ILIKE :search)")
            params['search'] = f"%{search}%"
        
        if role:
            where_clauses.append("r.nom ILIKE :role")
            params['role'] = f"%{role}%"
        
        if status:
            where_clauses.append("u.statut = :status")
            params['status'] = status
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Query using raw SQL
        query_str = f"""
            SELECT 
                u.utilisateur_id,
                u.nom_utilisateur,
                u.email,
                u.telephone,
                u.statut,
                r.nom as role_name
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON u.role_id = r.role_id
            WHERE {where_clause}
            ORDER BY u.utilisateur_id DESC
            LIMIT :limit OFFSET :offset
        """
        
        params['limit'] = limit
        params['offset'] = offset
        
        result = db.execute(text(query_str), params)
        users_data = result.fetchall()
        
        result_list = []
        for user in users_data:
            result_list.append(UserRead(
                id=int(user[0]),
                nom=user[1],
                email=user[2],
                telephone=user[3],
                role=user[5],
                status=user[4],
                dateCreation=None,
            ))
        
        logger.info(f"Listed {len(result_list)} users (page {page}, limit {limit})")
        return result_list
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    try:
        result = db.execute(text("""
            SELECT 
                u.utilisateur_id,
                u.nom_utilisateur,
                u.email,
                u.telephone,
                u.statut,
                r.nom as role_name
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON u.role_id = r.role_id
            WHERE u.utilisateur_id = :user_id
        """), {"user_id": user_id})
        
        user = result.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserRead(
            id=int(user[0]),
            nom=user[1],
            email=user[2],
            telephone=user[3],
            role=user[5],
            status=user[4],
            dateCreation=None,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
