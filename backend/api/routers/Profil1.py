# backend/api/routers/Profil1.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_db
from typing import Optional
import logging

logger      = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

router = APIRouter(tags=["Profil1"])


class UserCreate(BaseModel):
    nom:              str
    email:            EmailStr
    telephone:        Optional[str] = None
    adresse:          Optional[str] = None
    date_naissance:   Optional[str] = None   # ← pas de validation date future
    password:         str
    confirm_password: str


class UserResponse(BaseModel):
    id:      int
    nom:     str
    email:   str
    warning: Optional[str] = None


# ── POST /api/profil1/register/patient ───────────────────────
@router.post("/register/patient", response_model=UserResponse, status_code=201)
def register_patient(user: UserCreate, db: Session = Depends(get_db)):

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas.")
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (minimum 8 caractères).")

    # Email déjà utilisé ? — on avertit mais on n'empêche pas la création
    existing = db.execute(
        text("SELECT utilisateur_id FROM bioscan.utilisateur WHERE LOWER(email) = LOWER(:email)"),
        {"email": user.email.strip()}
    ).mappings().first()
    email_warning = "Cet email est déjà associé à un compte existant." if existing else None

    # Récupérer role_id Patient
    role = db.execute(
        text("SELECT role_id FROM bioscan.role WHERE LOWER(nom) = 'patient'")
    ).mappings().first()
    if not role:
        raise HTTPException(status_code=500, detail="Rôle 'Patient' introuvable.")

    hashed = pwd_context.hash(user.password)

    try:
        result = db.execute(text("""
            INSERT INTO bioscan.utilisateur
                (nom_utilisateur, email, mot_de_passe, telephone, adresse,
                 date_naissance, statut, role_id, date_generation, date_mise_a_jour)
            VALUES
                (:nom, :email, :pwd, :tel, :adr,
                 :dob, 'ACTIVE', :role_id, NOW(), NOW())
            RETURNING utilisateur_id, nom_utilisateur, email
        """), {
            "nom":     user.nom.strip(),
            "email":   user.email.strip().lower(),
            "pwd":     hashed,
            "tel":     user.telephone,
            "adr":     user.adresse,
            "dob":     user.date_naissance or None,
            "role_id": role["role_id"],
        })
        new_user = result.mappings().first()

        db.execute(
            text("INSERT INTO bioscan.patient (utilisateur_id) VALUES (:uid)"),
            {"uid": new_user["utilisateur_id"]}
        )
        db.commit()

        logger.info("[register] user_id=%s créé", new_user["utilisateur_id"])
        return UserResponse(
            id=new_user["utilisateur_id"],
            nom=new_user["nom_utilisateur"],
            email=new_user["email"],
            warning=email_warning,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error("[register] Erreur: %s", e)
        raise HTTPException(status_code=500, detail=f"Erreur inscription : {str(e)}")


# ── GET /api/profil1/profil/{user_id} ────────────────────────
@router.get("/profil/{user_id}", response_model=UserResponse)
def get_profil(user_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT utilisateur_id, nom_utilisateur, email FROM bioscan.utilisateur WHERE utilisateur_id = :uid"),
        {"uid": user_id}
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return UserResponse(id=row["utilisateur_id"], nom=row["nom_utilisateur"] or "", email=row["email"])