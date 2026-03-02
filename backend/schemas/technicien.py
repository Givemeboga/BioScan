from pydantic import BaseModel, EmailStr
from typing import Optional

class TechnicienCreate(BaseModel):
    nom_utilisateur: str
    email: EmailStr
    password: str
    telephone: str | None = None
    photo_url: Optional[str]

class TechnicienUpdate(BaseModel):
    telephone: Optional[str] = None
    matricule: Optional[str] = None

class PhotoResponse(BaseModel):
    message: str
    photo_url: str

class TechnicienResponse(BaseModel):
    technicien_id: int
    nom_utilisateur: str
    email: EmailStr
    telephone: str | None = None
    photo_url: Optional[str]

    class Config:
        from_attributes = True  # permet d'utiliser directement SQLAlchemy model
('argon2',)
