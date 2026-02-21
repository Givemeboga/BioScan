from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    nom: Optional[str]
    email: Optional[EmailStr]
    telephone: Optional[str]
    role: Optional[str]
    status: Optional[str] = "ACTIVE"


class UserCreate(UserBase):
    nom: str
    email: EmailStr
    role: str
    mot_de_passe: Optional[str]


class UserUpdate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    dateCreation: Optional[datetime]

    class Config:
        orm_mode = True
