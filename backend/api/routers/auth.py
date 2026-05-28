# backend/api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
import logging, traceback

from database import get_db
from utils.security import create_access_token

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentification"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    role:         str
    user_id:      int


@router.post("/login", response_model=TokenResponse)
def login(user: LoginRequest, db: Session = Depends(get_db)):
    try:
        # Newest account wins when duplicate emails exist
        row = db.execute(text("""
            SELECT
                u.utilisateur_id,
                u.email,
                u.mot_de_passe,
                u.statut::text             AS statut,
                COALESCE(r.nom, 'UNKNOWN') AS role_name
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON r.role_id = u.role_id
            WHERE LOWER(u.email) = LOWER(:email)
            ORDER BY u.utilisateur_id DESC
            LIMIT 1
        """), {"email": user.email.strip()}).mappings().first()

        if not row:
            logger.warning("[login] email not found: %s", user.email)
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

        logger.info("[login] found user_id=%s statut=%s role=%s hash_prefix=%s",
                    row["utilisateur_id"], row["statut"], row["role_name"],
                    (row["mot_de_passe"] or "")[:20])

        if not row["mot_de_passe"]:
            raise HTTPException(status_code=500, detail="Aucun mot de passe enregistré.")

        # ── Vérifier mot de passe ─────────────────────────────
        from passlib.context import CryptContext
        import hashlib

        pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
        ok = False

        try:
            ok = pwd_context.verify(user.password.strip(), row["mot_de_passe"])
            logger.info("[login] passlib verify → %s", ok)
        except Exception as e:
            logger.warning("[login] passlib verify raised %s — trying SHA256 fallback", e)
            try:
                provided_hash = hashlib.sha256(user.password.strip().encode()).hexdigest()
                ok = (provided_hash == row["mot_de_passe"])
                logger.info("[login] SHA256 fallback → %s", ok)
            except Exception as e2:
                logger.error("[login] SHA256 fallback also failed: %s", e2)
                ok = False

        if not ok:
            logger.warning("[login] password mismatch for user_id=%s", row["utilisateur_id"])
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

        # ── Vérifier statut — cast en str pour éviter pb enum ─
        statut = str(row["statut"]).strip().upper() if row["statut"] else ""
        if statut != "ACTIVE":
            raise HTTPException(
                status_code=403,
                detail=f"Compte inactif (statut={statut}). Contactez l'administrateur."
            )

        role_name = str(row["role_name"]).strip()

        token = create_access_token(
            data={"sub": str(row["utilisateur_id"]), "role": role_name},
            expires_delta=timedelta(hours=24),
        )

        logger.info("[login] SUCCESS user_id=%s role=%s", row["utilisateur_id"], role_name)

        return {
            "access_token": token,
            "token_type":   "bearer",
            "role":         role_name,
            "user_id":      row["utilisateur_id"],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("[login] CRASH: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")


@router.get("/debug/db")
def debug_db(db: Session = Depends(get_db)):
    try:
        tables = db.execute(text("""
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog','information_schema')
            ORDER BY table_schema, table_name
        """)).mappings().all()
        return {"status": "ok", "tables": [dict(t) for t in tables]}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT u.utilisateur_id, u.email, u.statut::text as statut, r.nom as role
            FROM bioscan.utilisateur u
            LEFT JOIN bioscan.role r ON r.role_id = u.role_id
            LIMIT 20
        """)).mappings().all()
        return {"count": len(rows), "users": [dict(r) for r in rows]}
    except Exception as e:
        return {"status": "error", "detail": str(e)}