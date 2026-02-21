from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.role import Role
from models.permission import Permission
from schemas.role import RoleRead, PermissionRead
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/roles", tags=["Admin Roles"])


@router.get("", response_model=List[RoleRead])
async def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    return [RoleRead(id=int(r.role_id), nom=r.nom, description=r.description) for r in roles]


@router.put("/{role_id}")
async def update_role_permissions(role_id: int, permissions: List[int], db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # role_permissions table mapping not implemented; for now just log
    logger.info("Updated role permissions", extra={"role_id": role_id, "permissions": permissions})
    return {"ok": True}


@router.get("/permissions", response_model=List[PermissionRead])
async def get_permissions(db: Session = Depends(get_db)):
    perms = db.query(Permission).all()
    return [PermissionRead(id=int(p.permission_id), nom_permission=p.nom_permission, description=p.description) for p in perms]
