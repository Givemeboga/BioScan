from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime
from database import Base
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    utilisateur_id = Column(Integer, primary_key=True, index=True)
    nom_utilisateur = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe = Column(String, nullable=False)
    telephone = Column(String(30), nullable=True)
    adresse = Column(String, nullable=True)
    date_naissance = Column(Date, nullable=True)
    statut = Column(String, default="ACTIVE")
    date_generation = Column(DateTime, default=datetime.utcnow)
    date_mise_a_jour = Column(DateTime, default=datetime.utcnow)
    role = Column(String, default="Patient")  # ok

# Fonctions utilitaires

def get_password_hash(password: str):
    return pwd_context.hash(password[:72])

def get_user_by_email(db, email: str):
    return db.query(Utilisateur).filter(Utilisateur.email == email).first()
