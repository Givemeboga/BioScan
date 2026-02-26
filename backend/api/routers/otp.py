from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from database import get_db
from models.utilisateur import Utilisateur
from models.code_otp import CodeOTP, StatutOTP
from schemas.otp import OtpRequest, VerifyOtpRequest, OtpResponse
from utils.email_utils import send_email

router = APIRouter(prefix="/auth", tags=["OTP"])

def generate_otp_code(length=6):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

@router.post("/send-otp", response_model=OtpResponse)
def send_otp(request: OtpRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    code = generate_otp_code()
    expiration = datetime.utcnow() + timedelta(minutes=5)

    # désactiver les OTP existants
    db.query(CodeOTP).filter(CodeOTP.utilisateur_id == user.utilisateur_id, CodeOTP.statut == StatutOTP.ACTIF)\
        .update({"statut": StatutOTP.EXPIRE})
    db.commit()

    new_otp = CodeOTP(
        code_generer=code,
        raison="Verification",
        statut=StatutOTP.ACTIF,
        date_generation=datetime.utcnow(),
        expiration=expiration,
        utilisateur_id=user.utilisateur_id
    )

    db.add(new_otp)
    db.commit()

    send_email(user.email, f"Votre code BioScan est : {code}")
    return {"message": "OTP envoyé avec succès"}

@router.post("/verify-otp", response_model=OtpResponse)
def verify_otp(request: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    otp_entry = db.query(CodeOTP)\
        .filter(CodeOTP.utilisateur_id == user.utilisateur_id, CodeOTP.statut == StatutOTP.ACTIF)\
        .order_by(CodeOTP.date_generation.desc()).first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="OTP non généré ou expiré")

    if otp_entry.code_generer != request.otp:
        raise HTTPException(status_code=400, detail="Code OTP incorrect")

    if datetime.utcnow() > otp_entry.expiration:
        otp_entry.statut = StatutOTP.EXPIRE
        db.commit()
        raise HTTPException(status_code=400, detail="Code OTP expiré")

    otp_entry.statut = StatutOTP.UTILISE
    db.commit()
    return {"message": "OTP validé avec succès"}
