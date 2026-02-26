# backend/api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from models.utilisateur import Utilisateur, pwd_context
from database import get_db
from utils.security import create_access_token
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(tags=["Authentification"])  # <- plus de prefix ici

# ✅ Modèles Pydantic
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

# ✅ Endpoint login
@router.post("/login", response_model=TokenResponse)
def login(user: LoginRequest, db: Session = Depends(get_db)):

    # 🔹 Vérifier si l'utilisateur existe
    db_user = (
        db.query(Utilisateur)
        .options(joinedload(Utilisateur.role))
        .filter(Utilisateur.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # 🔹 Vérifier mot de passe
    if not pwd_context.verify(user.password, db_user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # 🔹 Vérifier si l'utilisateur est actif
    if db_user.statut != "ACTIVE":
        raise HTTPException(status_code=403, detail="Utilisateur inactif, contactez l'administrateur")

    # 🔹 Récupérer le rôle
    role_name = db_user.role.nom if db_user.role else "UNKNOWN"

    # 🔹 Créer token JWT avec expiration 1h
    token = create_access_token(
        data={
            "sub": str(db_user.utilisateur_id),
            "role": role_name
        },
        expires_delta=timedelta(hours=1)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role_name,
        "user_id": db_user.utilisateur_id
    }
