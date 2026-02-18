from pydantic import BaseModel, EmailStr


class TechnicienCreate(BaseModel):
    nom_utilisateur: str
    email: EmailStr
    password: str
    telephone: str | None = None


class TechnicienResponse(BaseModel):
    technicien_id: int
    nom_utilisateur: str
    email: EmailStr
    telephone: str | None = None

    class Config:
        from_attributes = True  # permet d'utiliser directement SQLAlchemy model
