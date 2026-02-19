from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, EmailStr
from database import get_db
from models.utilisateur import Utilisateur, pwd_context
import secrets
import smtplib
from email.mime.text import MIMEText

router = APIRouter(prefix="/auth", tags=["Forgot Password"])

# ----------------------------
# Request model
# ----------------------------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# ----------------------------
# Email sender function
# ----------------------------
def send_email(to_email: str, new_password: str):
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USER = "Chaabenesarra3@gmail.com"
    SMTP_PASS = "sgkvfeekjrrsyrnm"  # ⚠️ mot de passe d'application Gmail, sans espaces

    subject = "Réinitialisation du mot de passe BioScan"

    body = f"""
Bonjour,

Votre nouveau mot de passe temporaire est :

{new_password}

Veuillez vous connecter puis le modifier immédiatement.

Equipe BioScan
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"Email envoyé à {to_email}")
    except Exception as e:
        print("Erreur envoi email:", e)
        raise

# ----------------------------
# Route forgot password
# ----------------------------
@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(Utilisateur).filter(Utilisateur.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Générer mot de passe temporaire sécurisé
    new_password = secrets.token_urlsafe(8)
    hashed_password = pwd_context.hash(new_password)
    user.mot_de_passe = hashed_password

    try:
        db.add(user)        # assure que l'objet est bien attaché
        db.commit()
        db.refresh(user)    # rafraîchir l'objet depuis la base
        print(f"Mot de passe mis à jour pour {user.email}")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

    # envoyer email
    try:
        send_email(user.email, new_password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email: {str(e)}")

    return {"message": "Un nouveau mot de passe a été envoyé à votre email"}
