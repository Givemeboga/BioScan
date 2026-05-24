from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schemas.user import UserRead
from pydantic import BaseModel
import logging
from datetime import datetime

from models.utilisateur import pwd_context
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"], dependencies=[Depends(get_current_user)])

# Request models
class UserCreateRequest(BaseModel):
    nom: str
    nom_utilisateur: Optional[str] = None
    email: str
    telephone: Optional[str] = None
    role: str = "Patient"
    status: Optional[str] = "ACTIVE"
    statut: Optional[str] = None  # Alternative field name
    mot_de_passe: Optional[str] = None
    motDePasse: Optional[str] = None  # Alternative field name
    password: Optional[str] = None  # Alternative field name

class UserUpdateRequest(BaseModel):
    nom: Optional[str] = None
    nom_utilisateur: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    role: Optional[str] = None

class UserStatusRequest(BaseModel):
    status: str

def hash_password(password: str) -> str:
    """Hash password using pbkdf2_sha256."""
    return pwd_context.hash(password)

def get_role_id(db: Session, role_name: str) -> Optional[int]:
    """Get role ID from role name"""
    try:
        result = db.execute(text("SELECT role_id FROM bioscan.role WHERE nom ILIKE :role_name"), 
                           {"role_name": role_name})
        row = result.fetchone()
        return row[0] if row else None
    except Exception as e:
        logger.error(f"Error getting role_id for {role_name}: {e}")
        return None


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

@router.post("", response_model=UserRead)
async def create_user(
    user_data: UserCreateRequest,
    db: Session = Depends(get_db),
):
    """Create a new user"""
    try:
        # Validate email doesn't exist
        existing = db.execute(text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE email = :email"),
                             {"email": user_data.email})
        if existing.fetchone():
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Get role_id
        role_id = get_role_id(db, user_data.role)
        if not role_id:
            raise HTTPException(status_code=400, detail=f"Role '{user_data.role}' not found")
        
        # Prepare data
        username = user_data.nom_utilisateur or user_data.nom
        password = user_data.mot_de_passe or user_data.motDePasse or user_data.password or "default123"
        password_hash = hash_password(password)
        status_val = user_data.status or user_data.statut or "ACTIVE"
        
        # Insert user
        insert_query = """
            INSERT INTO bioscan.utilisateur 
            (nom_utilisateur, email, telephone, statut, role_id, mot_de_passe)
            VALUES (:username, :email, :telephone, :status, :role_id, :password)
            RETURNING utilisateur_id
        """
        
        result = db.execute(text(insert_query), {
            "username": username,
            "email": user_data.email,
            "telephone": user_data.telephone,
            "status": status_val,
            "role_id": role_id,
            "password": password_hash,
        })
        db.commit()
        user_id = result.scalar()
        
        # Fetch and return created user
        return await get_user(user_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update user information"""
    try:
        user_exists = db.execute(text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE utilisateur_id = :id"),
                                {"id": user_id})
        if not user_exists.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build update query
        updates = []
        params = {"user_id": user_id}
        
        if user_data.nom:
            updates.append("nom_utilisateur = :nom")
            params["nom"] = user_data.nom
        if user_data.nom_utilisateur:
            updates.append("nom_utilisateur = :nom_utilisateur")
            params["nom_utilisateur"] = user_data.nom_utilisateur
        if user_data.email:
            updates.append("email = :email")
            params["email"] = user_data.email
        if user_data.telephone:
            updates.append("telephone = :telephone")
            params["telephone"] = user_data.telephone
        if user_data.role:
            role_id = get_role_id(db, user_data.role)
            if not role_id:
                raise HTTPException(status_code=400, detail=f"Role '{user_data.role}' not found")
            updates.append("role_id = :role_id")
            params["role_id"] = role_id
        
        if updates:
            update_query = f"UPDATE bioscan.utilisateur SET {', '.join(updates)} WHERE utilisateur_id = :user_id"
            db.execute(text(update_query), params)
            db.commit()
        
        return await get_user(user_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user and all dependent records"""
    try:
        user_exists = db.execute(text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE utilisateur_id = :id"),
                                {"id": user_id})
        if not user_exists.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete from all dependent tables first (cascade delete)
        # Delete from patient
        db.execute(text("DELETE FROM bioscan.patient WHERE utilisateur_id = :id"), {"id": user_id})
        
        # Delete from medecin_biologiste
        db.execute(text("DELETE FROM bioscan.medecin_biologiste WHERE utilisateur_id = :id"), {"id": user_id})
        
        # Delete from technicien_biologiste
        db.execute(text("DELETE FROM bioscan.technicien_biologiste WHERE utilisateur_id = :id"), {"id": user_id})
        
        # Delete from administrateur
        db.execute(text("DELETE FROM bioscan.administrateur WHERE utilisateur_id = :id"), {"id": user_id})
        
        # Now delete from utilisateur
        db.execute(text("DELETE FROM bioscan.utilisateur WHERE utilisateur_id = :id"), {"id": user_id})
        db.commit()
        logger.info(f"Deleted user {user_id} and all dependent records")
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/status", response_model=UserRead)
async def update_user_status(
    user_id: int,
    status_data: UserStatusRequest,
    db: Session = Depends(get_db),
):
    """Update user status"""
    try:
        user_exists = db.execute(text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE utilisateur_id = :id"),
                                {"id": user_id})
        if not user_exists.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Valid statuses: ACTIVE, INACTIVE, SUSPENDED
        if status_data.status not in ["ACTIVE", "INACTIVE", "SUSPENDED"]:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status_data.status}")
        
        db.execute(text("UPDATE bioscan.utilisateur SET statut = :status WHERE utilisateur_id = :id"),
                  {"status": status_data.status, "id": user_id})
        db.commit()
        
        return await get_user(user_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user status {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))