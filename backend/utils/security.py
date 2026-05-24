# backend/utils/security.py
from datetime import datetime, timedelta
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-key-change-in-production")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24h

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """
    Décode le JWT et retourne les infos de l'utilisateur connecté.
    Utilise SQL pur — AUCUN db.query(Utilisateur) pour éviter
    l'erreur 'role table not found'.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        utilisateur_id = payload.get("sub")
        role: str      = payload.get("role")

        if utilisateur_id is None:
            raise credentials_exception

        uid = int(utilisateur_id)

    except (JWTError, ValueError):
        raise credentials_exception

    # ── Vérifier que l'utilisateur existe encore en DB (SQL pur) ──
    row = db.execute(
        text("""
            SELECT u.utilisateur_id, u.statut, COALESCE(r.nom, :role_from_token) AS role_name
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON r.role_id = u.role_id
            WHERE u.utilisateur_id = :uid
        """),
        {"uid": uid, "role_from_token": role or "UNKNOWN"}
    ).mappings().first()

    if not row:
        raise credentials_exception

    return {
        "user_id":        uid,
        "utilisateur_id": uid,       # alias pour compatibilité
        "role":           row["role_name"] or role or "UNKNOWN",
        "statut":         row["statut"],
    }


# ── Alias pour compatibilité avec l'ancien code ───────────────
def verify_access_token(token: str) -> dict:
    """
    Alias de get_current_user pour les routers qui importent
    verify_access_token directement (sans Depends).
    Retourne le payload décodé ou lève HTTPException 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        utilisateur_id = payload.get("sub")
        role           = payload.get("role")
        if utilisateur_id is None:
            raise credentials_exception
        uid = int(utilisateur_id)
        return {
            "user_id":        uid,
            "utilisateur_id": uid,
            "role":           role or "UNKNOWN",
        }
    except (JWTError, ValueError):
        raise credentials_exception