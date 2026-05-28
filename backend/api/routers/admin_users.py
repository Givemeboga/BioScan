from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from schemas.user import UserCreate, UserRead, UserUpdate
from sqlalchemy.exc import SQLAlchemyError
from models.utilisateur import Utilisateur, get_user_by_email, get_password_hash
from models.role import Role
from models.evenement_securite import EvenementSecurite
from models.medecin import MedecinBiologiste
from models.technicien import TechnicienBiologiste
from models.administrateur import Administrateur
from models.patient import Patient
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"])


def _get_role_name(db: Session, role_id: int) -> Optional[str]:
    """Helper to get role name from role_id"""
    if not role_id:
        return None
    role = db.query(Role).filter(Role.role_id == role_id).first()
    return role.nom if role else None


def _get_role_id(db: Session, role_name: str) -> Optional[int]:
    """Helper to get role_id from role name"""
    if not role_name:
        return None
    role = db.query(Role).filter(Role.nom.ilike(role_name)).first()
    return role.role_id if role else None


def _paginate_query(query, page: int, limit: int):
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)


def _log_event(db: Session, user_id: int, event_type: str, status_str: str = "SUCCESS"):
    """Helper to log events to evenement_securite table using raw SQL"""
    try:
        from sqlalchemy import text
        query = """
            INSERT INTO bioscan.evenement_securite (utilisateur_id, type_evenement, status)
            VALUES (:user_id, :event_type, :status)
        """
        db.execute(text(query), {"user_id": user_id, "event_type": event_type, "status": status_str})
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log event: {e}")
        # Don't raise, just log the error silently


@router.get("", response_model=List[UserRead])
async def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Utilisateur)
    if search:
        like_q = f"%{search}%"
        query = query.filter((Utilisateur.nom_utilisateur.ilike(like_q)) | (Utilisateur.email.ilike(like_q)))
    if role:
        # Filter by role name
        query = query.join(Role, Utilisateur.role_id == Role.role_id, isouter=True)
        query = query.filter(Role.nom.ilike(role))
    else:
        query = query.join(Role, Utilisateur.role_id == Role.role_id, isouter=True)
    
    if status:
        query = query.filter(Utilisateur.statut == status)

    # Les comptes les plus récents en premier (les nouvelles inscriptions
    # apparaissent en haut de la liste plutôt que noyées dans la pagination)
    query = query.order_by(Utilisateur.utilisateur_id.desc())

    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    logger.info("Listed users", extra={"count": len(users), "page": page})

    result = []
    for u in users:
        role_name = _get_role_name(db, u.role_id)
        result.append(UserRead(
            id=int(u.utilisateur_id),
            nom=u.nom_utilisateur,
            email=u.email,
            telephone=u.telephone,
            role=role_name,
            status=(str(u.statut) if u.statut is not None else None),
            dateCreation=(u.date_generation.isoformat() if u.date_generation else None),
        ))
    return result


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    role_name = _get_role_name(db, user.role_id)
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=role_name,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        # Basic uniqueness check
        existing = get_user_by_email(db, str(user_in.email))
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        now = datetime.datetime.now(datetime.timezone.utc)
        status_value = (user_in.status or "ACTIVE").upper()
        password_raw = user_in.mot_de_passe or "default_password"
        password_value = str(password_raw)
        password_bytes_len = len(password_value.encode("utf-8"))
        logger.info(
            "Create user password length",
            extra={"length": password_bytes_len, "type": type(password_raw).__name__},
        )
        if password_bytes_len > 72:
            raise HTTPException(
                status_code=400,
                detail="Password too long for bcrypt (max 72 bytes)"
            )
        
        # Get role_id from role name
        role_id = None
        if user_in.role:
            role_id = _get_role_id(db, user_in.role)
            if not role_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Role '{user_in.role}' not found"
                )
        
        user = Utilisateur(
            nom_utilisateur=user_in.nom,
            email=str(user_in.email),
            mot_de_passe=get_password_hash(password_value),
            telephone=user_in.telephone,
            statut=status_value,
            role_id=role_id,
            date_generation=now,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Log user creation event
        _log_event(db, int(user.utilisateur_id), "Creation_utilisateur", "SUCCESS")
        
        # Add user to role-specific table based on role
        if user_in.role:
            role_name_lower = user_in.role.lower()
            try:
                if 'medecin' in role_name_lower:
                    medecin = MedecinBiologiste(utilisateur_id=user.utilisateur_id)
                    db.add(medecin)
                elif 'technicien' in role_name_lower:
                    technicien = TechnicienBiologiste(utilisateur_id=user.utilisateur_id)
                    db.add(technicien)
                elif 'administrateur' in role_name_lower or 'admin' in role_name_lower:
                    admin = Administrateur(utilisateur_id=user.utilisateur_id)
                    db.add(admin)
                elif 'patient' in role_name_lower:
                    patient = Patient(utilisateur_id=user.utilisateur_id, actif=True)
                    db.add(patient)
                db.commit()
            except Exception as exc:
                logger.warning(f"Failed to add user to role table: {exc}")
                # Don't fail the entire operation if role table insertion fails
                db.rollback()
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to create user")
        raise HTTPException(
            status_code=500,
            detail=f"Database error while creating user: {exc}"
        )
    except Exception as exc:
        db.rollback()
        logger.exception("Unexpected error while creating user")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while creating user: {exc}"
        )
    logger.info("Created user", extra={"user_id": int(user.utilisateur_id)})
    role_name = _get_role_name(db, user.role_id)
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=role_name,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_in.nom:
        user.nom_utilisateur = user_in.nom
    if user_in.email:
        user.email = str(user_in.email)
    if user_in.telephone:
        user.telephone = user_in.telephone
    if user_in.role:
        role_id = _get_role_id(db, user_in.role)
        if not role_id:
            raise HTTPException(status_code=400, detail=f"Role '{user_in.role}' not found")
        user.role_id = role_id
    if user_in.status:
        user.statut = user_in.status
    db.commit()
    db.refresh(user)
    logger.info("Updated user", extra={"user_id": int(user.utilisateur_id)})
    # Log the user update event
    _log_event(db, int(user.utilisateur_id), "Modification_utilisateur", "SUCCESS")
    role_name = _get_role_name(db, user.role_id)
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=role_name,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Log the user deletion event before deleting
    _log_event(db, user_id, "Suppression_utilisateur", "SUCCESS")
    db.delete(user)
    db.commit()
    logger.info("Deleted user", extra={"user_id": user_id})
    return


@router.patch("/{user_id}/status", response_model=UserRead)
async def patch_user_status(user_id: int, status_data: dict = Body(...), db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    status_value = status_data.get("status")
    if not status_value:
        raise HTTPException(status_code=400, detail="Status is required")
    user.statut = status_value
    db.commit()
    db.refresh(user)
    logger.info("Updated user status", extra={"user_id": user_id, "status": status_value})
    # Log the status change event
    _log_event(db, user_id, f"Changement_statut", status_value)
    role_name = _get_role_name(db, user.role_id)
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=role_name,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.patch("/bulk/role", status_code=status.HTTP_200_OK)
async def bulk_update_role(userIds: List[int], newRole: str, db: Session = Depends(get_db)):
    # Get the role_id from role name
    role_id = _get_role_id(db=db, role_name=newRole)
    if not role_id:
        raise HTTPException(status_code=400, detail=f"Role '{newRole}' not found")
    
    users = db.query(Utilisateur).filter(Utilisateur.utilisateur_id.in_(userIds)).all()
    for u in users:
        u.role_id = role_id
    db.commit()
    logger.info("Bulk updated roles", extra={"user_count": len(users), "new_role": newRole})
    return {"updated": len(users)}


@router.post("/{user_id}/reset-password", response_model=dict)
async def reset_password(user_id: int, db: Session = Depends(get_db)):
    """Reset user password to default: Password123!"""
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    default_password = "Password123!"
    user.mot_de_passe = get_password_hash(default_password)
    db.commit()
    logger.info("Reset password for user", extra={"user_id": user_id})
    # Log the password reset event
    _log_event(db, user_id, "Reinitialisation_motdepasse", "SUCCESS")
    return {
        "message": f"Password reset successfully. New password: {default_password}",
        "default_password": default_password
    }


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
    from sqlalchemy import text
    query_str = """
        SELECT 
            ip,
            agent_utilisateur,
            status,
            type_evenement
        FROM bioscan.evenement_securite
        WHERE utilisateur_id = :user_id
        ORDER BY evenement_id DESC
        LIMIT :limit
    """
    
    result = db.execute(text(query_str), {"user_id": user_id, "limit": limit})
    rows = result.fetchall()
    
    history = []
    for row in rows:
        history.append({
            "ip": row[0],
            "user_agent": row[1],
            "status": row[2],
            "type": row[3]
        })
    
    logger.info("Fetched login history", extra={"user_id": user_id, "count": len(history)})
    return {
        "user_id": user_id,
        "user_name": user.nom_utilisateur,
        "history": history
    }
