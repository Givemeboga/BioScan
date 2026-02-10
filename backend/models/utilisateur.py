from sqlalchemy import Column, Integer, String, Boolean
from database import Base
from passlib.context import CryptContext
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id = Column(Integer, primary_key=True, index=True)
    nom_utilisateur = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="medecin")  # ex: admin, medecin, technicien
    specialite = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)


# ---- Fonctions utilitaires ----

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_by_username(db: Session, username: str):
    return db.query(Utilisateur).filter(Utilisateur.nom_utilisateur == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(Utilisateur).filter(Utilisateur.email == email).first()
