# backend/schemas/utilisateur.py

from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import date
from typing import Optional


class UserCreate(BaseModel):
    nom:              str
    email:            EmailStr
    telephone:        str
    adresse:          str
    date_naissance:   date
    password:         str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.confirm_password:
            raise ValueError("Les mots de passe ne correspondent pas.")
        return self

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères.")
        return v

    @field_validator("telephone")
    @classmethod
    def telephone_format(cls, v: str) -> str:
        digits = v.replace(" ", "").replace("+", "").replace("-", "")
        if not digits.isdigit() or not (8 <= len(digits) <= 15):
            raise ValueError("Numéro de téléphone invalide.")
        return v

    @field_validator("date_naissance")
    @classmethod
    def date_naissance_past(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("La date de naissance doit être dans le passé.")
        return v


class UserResponse(BaseModel):
    id:    int
    nom:   str
    email: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    nom:            Optional[str]  = None
    telephone:      Optional[str]  = None
    adresse:        Optional[str]  = None
    date_naissance: Optional[date] = None

    class Config:
        from_attributes = True