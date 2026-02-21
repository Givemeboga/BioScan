from pydantic import BaseModel
from typing import List, Optional


class RoleRead(BaseModel):
    id: int
    nom: str
    description: Optional[str]

    class Config:
        orm_mode = True


class PermissionRead(BaseModel):
    id: int
    nom_permission: str
    description: Optional[str]

    class Config:
        orm_mode = True
