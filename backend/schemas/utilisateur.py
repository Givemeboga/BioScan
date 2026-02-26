from pydantic import BaseModel, EmailStr
from datetime import date

# Requête pour créer un utilisateur
class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: str
    adresse: str
    date_naissance: date
    password: str
    confirm_password: str

# Réponse renvoyée au frontend
class UserResponse(BaseModel):
    id: int
    nom: str
    email: str

    class Config:
        from_attributes = True
