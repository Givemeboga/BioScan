# backend/schemas/role.py

from pydantic import BaseModel
from typing import Optional, List


class RoleCreate(BaseModel):
    nom:         str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    nom:         Optional[str] = None
    description: Optional[str] = None


class RoleRead(BaseModel):
    role_id:     int
    nom:         str
    description: Optional[str] = None

    model_config = {"from_attributes": True}  # Pydantic v2


class PermissionRead(BaseModel):
    id:             int
    nom_permission: str
    description:    Optional[str] = None

    model_config = {"from_attributes": True}


class RoleWithPermissions(BaseModel):
    role_id:     int
    nom:         str
    description: Optional[str]       = None
    permissions: List[PermissionRead] = []

    model_config = {"from_attributes": True}