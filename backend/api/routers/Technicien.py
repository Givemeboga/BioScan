from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.utilisateur import Utilisateur
from models.technicienBiologiste import TechnicienBiologiste
from auth.authTech import create_access_token
from passlib.context import CryptContext
from schemas.auth import LoginSchema
from fastapi import File, UploadFile, Form
from schemas.technicien import TechnicienCreate
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime
from typing import Optional
from schemas.technicien import TechnicienResponse, TechnicienUpdate  # Créez ces schemas
from models.bilan_biologique import BilanBiologique
from sqlalchemy import func, and_
from auth.authTech import create_access_token, SECRET_KEY, ALGORITHM
from services.cloudinary import upload_image
from schemas.technicien import PhotoResponse
from typing import Dict
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/tech/login/technicien")

router = APIRouter(prefix="/tech", tags=["technicien"])

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
print(pwd_context.schemes())  # Doit afficher ['argon2']



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_technicien(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_id = payload.get("user_id")

        if not username or not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")

        user = db.query(Utilisateur).filter(
            Utilisateur.utilisateur_id == user_id,
            Utilisateur.nom_utilisateur == username
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur invalide")

        technicien = db.query(TechnicienBiologiste).filter(
            TechnicienBiologiste.utilisateur_id == user.utilisateur_id
        ).first()

        if not technicien:
            raise HTTPException(status_code=403, detail="Technicien requis")

        return technicien

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
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

# 1. PROFIL ✅
@router.get("/profil", response_model=TechnicienResponse)
def get_profil(technicien: TechnicienBiologiste = Depends(get_current_technicien)):
    return TechnicienResponse(
        technicien_id=technicien.technicien_id,
        nom_utilisateur=technicien.utilisateur.nom_utilisateur,
        email=technicien.utilisateur.email,
        telephone=technicien.utilisateur.telephone,
        matricule=f"TECH-{technicien.technicien_id:06d}",
        photo_url=technicien.utilisateur.photo_url
    )
# 2. MODIFIER PROFIL ✅
@router.put("/profil")
async def update_profil(
    fullName: str = Form(...),
    telephone: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    technicien: TechnicienBiologiste = Depends(get_current_technicien),
    db: Session = Depends(get_db)
):

    # ✅ Mise à jour utilisateur
    if fullName:
        technicien.utilisateur.nom_utilisateur = fullName

    if telephone:
        technicien.utilisateur.telephone = telephone

    # ✅ Upload image
    if avatar:
        photo_url = upload_image(avatar, folder="techniciens")
        print(photo_url)
        technicien.utilisateur.photo_url = photo_url

    db.commit()
    db.refresh(technicien)

    return {
        "message": "Profil mis à jour",
        "fullName": technicien.utilisateur.nom_utilisateur,
        "telephone": technicien.utilisateur.telephone,
        "photo_url": technicien.utilisateur.photo_url
    }

@router.post("/profil/photo", response_model=PhotoResponse)
async def update_photo(
        file: UploadFile = File(...),
        technicien: TechnicienBiologiste = Depends(get_current_technicien),
        db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Met à jour la photo du technicien et la sauvegarde sur Cloudinary
    """
    if not file:
        raise HTTPException(status_code=400, detail="Aucun fichier fourni")

    try:
        photo_url = upload_image(file, folder="techniciens")
        print(photo_url)
    except HTTPException as e:
        raise e

    technicien.utilisateur.photo_url = photo_url
    db.commit()
    db.refresh(technicien)

    return {"message": "Photo mise à jour", "photo_url": photo_url}

# 3. STATS ✅
@router.get("/stats")
def get_stats(
        technicien: TechnicienBiologiste = Depends(get_current_technicien),
        db: Session = Depends(get_db)
):
    bilans = db.query(func.count(BilanBiologique.bilan_id)).filter(
        BilanBiologique.technicien_id == technicien.technicien_id
    ).scalar() or 0

    return {
        "analyses": bilans,
        "services": bilans * 2,
        "satisfaction": 96.5,
        "derniere_connexion": str(datetime.now())
    }

# 4. CHANGER MOT DE PASSE ✅
@router.post("/change-password")
def change_password(
        data: dict,
        technicien: TechnicienBiologiste = Depends(get_current_technicien),
        db: Session = Depends(get_db)
):
    if not pwd_context.verify(data["ancien_password"], technicien.utilisateur.mot_de_passe):
        raise HTTPException(status_code=400, detail="Ancien mot de passe faux")

    technicien.utilisateur.mot_de_passe = pwd_context.hash(data["nouveau_password"])
    db.commit()
    return {"message": "Mot de passe changé"}