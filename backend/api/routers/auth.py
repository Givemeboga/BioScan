# backend/api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from utils.security import create_access_token
from pydantic import BaseModel
from datetime import timedelta
import hashlib

router = APIRouter(tags=["Authentification"])

# ✅ Modèles Pydantic
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

def hash_password(password: str) -> str:
    """Hash password using sha256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(provided_password: str, stored_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(provided_password) == stored_hash

# ✅ Endpoint login
@router.post("/login", response_model=TokenResponse)
def login(user: LoginRequest, db: Session = Depends(get_db)):
    try:
        # 🔹 Query user with role using raw SQL
        result = db.execute(text("""
            SELECT 
                u.utilisateur_id,
                u.email,
                u.mot_de_passe,
                u.statut,
                r.nom as role_name
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON u.role_id = r.role_id
            WHERE u.email = :email
        """), {"email": user.email})
        
        db_user = result.fetchone()
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        user_id, email, password_hash, statut, role_name = db_user
        
        # 🔹 Vérifier mot de passe
        if not verify_password(user.password, password_hash):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # 🔹 Vérifier si l'utilisateur est actif
        if statut != "ACTIVE":
            raise HTTPException(status_code=403, detail="Utilisateur inactif, contactez l'administrateur")
        
        # 🔹 Créer token JWT avec expiration 1h
        token = create_access_token(
            data={
                "sub": str(user_id),
                "role": role_name or "UNKNOWN"
            },
            expires_delta=timedelta(hours=1)
        )
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role_name or "UNKNOWN",
            "user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
