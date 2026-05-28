# backend/api/routers/forgot_password.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_db
import secrets, smtplib, logging
from email.mime.text import MIMEText

logger     = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["Forgot Password"])

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT   = 587
SMTP_USER   = "Chaabenesarra3@gmail.com"
SMTP_PASS   = "sgkvfeekjrrsyrnm"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


def send_email(to_email: str, new_password: str):
    body = f"""Bonjour,

Votre nouveau mot de passe temporaire BioScan est :

    {new_password}

Veuillez vous connecter puis le modifier immédiatement.

Équipe BioScan
"""
    msg            = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = "Réinitialisation du mot de passe BioScan"
    msg["From"]    = SMTP_USER
    msg["To"]      = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

    logger.info("[forgot_password] Email envoyé à %s", to_email)


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Réinitialise le mot de passe via SQL pur — sans db.query(Utilisateur)
    pour éviter l'erreur 'role table not found'.
    """
    # ── Chercher l'utilisateur par email (SQL pur) ────────────
    row = db.execute(
        text("SELECT utilisateur_id, email FROM bioscan.utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": request.email.strip()}
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Aucun compte associé à cet email.")

    # ── Générer nouveau mot de passe ──────────────────────────
    new_password    = secrets.token_urlsafe(8)
    hashed_password = pwd_context.hash(new_password)

    # ── Mettre à jour en DB ───────────────────────────────────
    try:
        db.execute(
            text("UPDATE bioscan.utilisateur SET mot_de_passe = :pwd WHERE utilisateur_id = :uid"),
            {"pwd": hashed_password, "uid": row["utilisateur_id"]}
        )
        db.commit()
        logger.info("[forgot_password] Mot de passe mis à jour pour user_id=%s", row["utilisateur_id"])
    except Exception as e:
        db.rollback()
        logger.error("[forgot_password] Erreur DB: %s", e)
        raise HTTPException(status_code=500, detail=f"Erreur base de données : {str(e)}")

    # ── Envoyer email ─────────────────────────────────────────
    try:
        send_email(row["email"], new_password)
    except Exception as e:
        logger.error("[forgot_password] Erreur email: %s", e)
        raise HTTPException(status_code=500, detail=f"Mot de passe réinitialisé mais email non envoyé : {str(e)}")

    return {"message": "Un nouveau mot de passe a été envoyé à votre adresse email."}