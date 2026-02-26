# backend/api/routers/otp.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from database import get_db
from utils.email_utils import send_email
import random, logging

logger = logging.getLogger(__name__)

# ✅ prefix="/auth" → combiné avec prefix="/api" dans main.py → /api/auth/...
router = APIRouter(prefix="/auth", tags=["OTP"])


class OtpRequest(BaseModel):
    email:  EmailStr
    raison: str = "Verification"

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp:   str

class OtpResponse(BaseModel):
    message: str


def generate_otp_code(length=6) -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


# ── POST /api/auth/send-otp ───────────────────────────────────
@router.post("/send-otp", response_model=OtpResponse)
def send_otp(request: OtpRequest, db: Session = Depends(get_db)):

    user = db.execute(
        text("SELECT utilisateur_id, email FROM utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": request.email.strip()}
    ).mappings().first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    uid  = user["utilisateur_id"]
    code = generate_otp_code()
    exp  = datetime.utcnow() + timedelta(minutes=5)

    # Désactiver OTP existants
    db.execute(
        text("UPDATE code_otp SET statut = 'EXPIRE' WHERE utilisateur_id = :uid AND statut = 'ACTIF'"),
        {"uid": uid}
    )

    # Créer nouvel OTP
    db.execute(text("""
        INSERT INTO code_otp (code_generer, raison, statut, date_generation, expiration, utilisateur_id)
        VALUES (:code, :raison, 'ACTIF', NOW(), :exp, :uid)
    """), {"code": code, "raison": request.raison, "exp": exp, "uid": uid})

    db.commit()

    try:
        send_email(user["email"], f"Votre code BioScan est : {code}")
        logger.info("[send_otp] OTP envoyé à %s", user["email"])
    except Exception as e:
        logger.error("[send_otp] Erreur email: %s", e)
        raise HTTPException(status_code=500, detail=f"OTP créé mais email non envoyé : {str(e)}")

    return {"message": "OTP envoyé avec succès"}


# ── POST /api/auth/verify-otp ─────────────────────────────────
@router.post("/verify-otp", response_model=OtpResponse)
def verify_otp(request: VerifyOtpRequest, db: Session = Depends(get_db)):

    user = db.execute(
        text("SELECT utilisateur_id FROM utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": request.email.strip()}
    ).mappings().first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    uid = user["utilisateur_id"]

    otp_entry = db.execute(text("""
        SELECT code_otp_id, code_generer, expiration
        FROM code_otp
        WHERE utilisateur_id = :uid AND statut = 'ACTIF'
        ORDER BY date_generation DESC
        LIMIT 1
    """), {"uid": uid}).mappings().first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="OTP non généré ou expiré")

    # ✅ Vérifier expiration AVANT le code (meilleure UX)
    if datetime.utcnow() > otp_entry["expiration"]:
        db.execute(
            text("UPDATE code_otp SET statut = 'EXPIRE' WHERE code_otp_id = :id"),
            {"id": otp_entry["code_otp_id"]}
        )
        db.commit()
        raise HTTPException(status_code=400, detail="Code OTP expiré")

    if otp_entry["code_generer"] != request.otp:
        raise HTTPException(status_code=400, detail="Code OTP incorrect")

    db.execute(
        text("UPDATE code_otp SET statut = 'UTILISE' WHERE code_otp_id = :id"),
        {"id": otp_entry["code_otp_id"]}
    )
    db.commit()

    logger.info("[verify_otp] OTP validé pour uid=%s", uid)
    return {"message": "OTP validé avec succès"}