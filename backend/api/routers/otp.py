# backend/api/routers/otp.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from utils.email_utils import send_email
import random, logging

logger = logging.getLogger(__name__)

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


@router.post("/send-otp", response_model=OtpResponse)
def send_otp(request: OtpRequest, db: Session = Depends(get_db)):

    # ✅ bioscan.utilisateur — c'est là que sont les données
    user = db.execute(
        text("SELECT utilisateur_id, email FROM bioscan.utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": request.email.strip()}
    ).mappings().first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    uid  = user["utilisateur_id"]
    code = generate_otp_code()

    db.execute(
        text("UPDATE bioscan.code_otp SET statut = 'EXPIRE' WHERE utilisateur_id = :uid AND statut = 'ACTIF'"),
        {"uid": uid}
    )

    db.execute(text("""
        INSERT INTO bioscan.code_otp (code_generer, raison, statut, date_generation, expiration, utilisateur_id)
        VALUES (:code, :raison, 'ACTIF', NOW(), NOW() + INTERVAL '10 minutes', :uid)
    """), {"code": code, "raison": request.raison, "uid": uid})

    db.commit()

    # Always log OTP to console for dev/testing
    logger.info("[send_otp] OTP for %s : %s", user["email"], code)

    try:
        send_email(user["email"], f"Votre code BioScan est : {code}")
        logger.info("[send_otp] OTP envoyé à %s", user["email"])
    except Exception as e:
        logger.warning("[send_otp] Email non envoyé (%s) — utilisez le code dans les logs backend", e)

    return {"message": "OTP envoyé avec succès"}


@router.post("/verify-otp", response_model=OtpResponse)
def verify_otp(request: VerifyOtpRequest, db: Session = Depends(get_db)):

    user = db.execute(
        text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": request.email.strip()}
    ).mappings().first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    uid = user["utilisateur_id"]

    otp_entry = db.execute(text("""
        SELECT otp_id, code_generer,
               (expiration < NOW()) AS est_expire
        FROM bioscan.code_otp
        WHERE utilisateur_id = :uid AND statut = 'ACTIF'
        ORDER BY date_generation DESC
        LIMIT 1
    """), {"uid": uid}).mappings().first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Aucun OTP actif. Demandez un nouveau code.")

    if otp_entry["code_generer"] != request.otp:
        raise HTTPException(status_code=400, detail="Code OTP incorrect")

    if otp_entry["est_expire"]:
        db.execute(
            text("UPDATE bioscan.code_otp SET statut = 'EXPIRE' WHERE otp_id = :id"),
            {"id": otp_entry["otp_id"]}
        )
        db.commit()
        raise HTTPException(status_code=400, detail="Code OTP expiré. Cliquez sur 'Renvoyer le code'.")

    db.execute(
        text("UPDATE bioscan.code_otp SET statut = 'UTILISE' WHERE otp_id = :id"),
        {"id": otp_entry["otp_id"]}
    )
    db.commit()

    logger.info("[verify_otp] OTP validé pour uid=%s", uid)
    return {"message": "OTP validé avec succès"}