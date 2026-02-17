from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur, get_password_hash, get_user_by_email
from schemas.utilisateur import UserCreate, UserResponse
from models.patient import Patient

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register/patient", response_model=UserResponse)
def register_patient(user: UserCreate, db: Session = Depends(get_db)):

    # Vérifier mot de passe
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")

    # Vérifier email existant
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Hash mot de passe (troncature à 72 caractères pour bcrypt)
    hashed_password = get_password_hash(user.password)

    # Création utilisateur avec role par défaut "PATIENT"
    new_user = Utilisateur(
        nom_utilisateur=user.nom,
        email=user.email,
        mot_de_passe=hashed_password,
        telephone=user.telephone,
        adresse=user.adresse,
        date_naissance=user.date_naissance,
        statut="ACTIVE",
        role="Patient"  # ✅ important !
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Création patient liée
        new_patient = Patient(utilisateur_id=new_user.utilisateur_id)
        db.add(new_patient)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de l'inscription")

    return UserResponse(
        id=new_user.utilisateur_id,
        nom=new_user.nom_utilisateur,
        email=new_user.email
    )
