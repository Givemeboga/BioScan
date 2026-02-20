from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserRead, UserUpdate
from sqlalchemy.exc import SQLAlchemyError
from models.utilisateur import Utilisateur, get_user_by_email, get_password_hash
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"])


def _paginate_query(query, page: int, limit: int):
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)


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
        # role is not currently stored on Utilisateur; skip or filter via join in future
        pass
    if status:
        query = query.filter(Utilisateur.statut == status)

    users = _paginate_query(query, page, limit).all()
    logger.info("Listed users", extra={"count": len(users), "page": page})

    result = []
    for u in users:
        result.append(UserRead(
            id=int(u.utilisateur_id),
            nom=u.nom_utilisateur,
            email=u.email,
            telephone=u.telephone,
            role=None,
            status=(str(u.statut) if u.statut is not None else None),
            dateCreation=(u.date_generation.isoformat() if u.date_generation else None),
        ))
    return result


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
        user = Utilisateur(
            nom_utilisateur=user_in.nom,
            email=str(user_in.email),
            mot_de_passe=get_password_hash(password_value),
            telephone=user_in.telephone,
            statut=status_value,
            date_generation=now,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
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
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=user_in.role,
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
    db.commit()
    db.refresh(user)
    logger.info("Updated user", extra={"user_id": int(user.utilisateur_id)})
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=None,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    logger.info("Deleted user", extra={"user_id": user_id})
    return


@router.patch("/{user_id}/status", response_model=UserRead)
async def patch_user_status(user_id: int, status: str, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.statut = status
    db.commit()
    db.refresh(user)
    logger.info("Updated user status", extra={"user_id": user_id, "status": status})
    return UserRead(
        id=int(user.utilisateur_id),
        nom=user.nom_utilisateur,
        email=user.email,
        telephone=user.telephone,
        role=None,
        status=(str(user.statut) if user.statut is not None else None),
        dateCreation=(user.date_generation.isoformat() if user.date_generation else None),
    )


@router.patch("/bulk/role", status_code=status.HTTP_200_OK)
async def bulk_update_role(userIds: List[int], newRole: str, db: Session = Depends(get_db)):
    users = db.query(Utilisateur).filter(Utilisateur.utilisateur_id.in_(userIds)).all()
    for u in users:
        # Role field not stored on Utilisateur in current model; here for demonstration
        pass
    db.commit()
    logger.info("Bulk updated roles", extra={"user_count": len(users)})
    return {"updated": len(users)}
