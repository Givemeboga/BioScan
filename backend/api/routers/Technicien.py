from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.utilisateur import Utilisateur
from models.technicienBiologiste import TechnicienBiologiste
from auth.authTech import create_access_token
from passlib.context import CryptContext
from schemas.auth import LoginSchema
from schemas.technicien import TechnicienCreate
from passlib.context import CryptContext
router = APIRouter(prefix="/tech", tags=["technicien"])



pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
print(pwd_context.schemes())  # Doit afficher ['argon2']



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# LOGIN TECHNICIEN
# =========================
@router.post("/login/technicien")
def login_technicien(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(Utilisateur).filter(
        Utilisateur.nom_utilisateur == data.username
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable")

    if not pwd_context.verify(data.password, user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")

    technicien = db.query(TechnicienBiologiste).filter(
        TechnicienBiologiste.utilisateur_id == user.utilisateur_id
    ).first()

    if not technicien:
        raise HTTPException(
            status_code=403,
            detail="Accès refusé : vous n'êtes pas technicien"
        )

    access_token = create_access_token(
        data={
            "sub": user.nom_utilisateur,
            "role": "technicien",
            "user_id": user.utilisateur_id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "technicien"
    }


# =========================
# ADD TECHNICIEN
# =========================
@router.post("/add/technicien")
def add_technicien(
    data: TechnicienCreate,
    db: Session = Depends(get_db)
):

    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(Utilisateur).filter(
        (Utilisateur.nom_utilisateur == data.nom_utilisateur) |
        (Utilisateur.email == data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Utilisateur déjà existant")

    # Créer l'utilisateur
    hashed_password = pwd_context.hash(data.password)
    new_user = Utilisateur(
        nom_utilisateur=data.nom_utilisateur,
        email=data.email,
        mot_de_passe=hashed_password,
        telephone=data.telephone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Créer la relation technicien
    new_tech = TechnicienBiologiste(utilisateur_id=new_user.utilisateur_id)
    db.add(new_tech)
    db.commit()
    db.refresh(new_tech)

    # Créer le token
    token = create_access_token({
        "sub": new_user.nom_utilisateur,
        "role": "technicien",
        "user_id": new_user.utilisateur_id
    })

    return {"access_token": token, "token_type": "bearer", "role": "technicien"}