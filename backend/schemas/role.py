from pydantic import BaseModel
from typing import List, Optional


class RoleRead(BaseModel):
    id: int
    nom: str
    description: Optional[str]
    model_config = {"from_attributes": True}


class PermissionRead(BaseModel):
    id: int
    nom_permission: str
    description: Optional[str]
    model_config = {"from_attributes": True}
