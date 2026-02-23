from sqlalchemy import Column, BigInteger, String, Boolean, Date, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import Session, synonym, relationship
from database import Base
from passlib.context import CryptContext
import datetime

# Use pbkdf2_sha256 for password hashing (no bcrypt dependency issues).
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Enum type name must match the DB enum 'statut_user' and live in the 'bioscan' schema
STATUT_USER = Enum('ACTIVE', 'INACTIVE', name='statut_user', schema='bioscan')


class Utilisateur(Base):
    __tablename__ = "utilisateur"
    __table_args__ = {"schema": "bioscan"}

    utilisateur_id = Column(BigInteger, primary_key=True, index=True)
    nom_utilisateur = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    mot_de_passe = Column(Text, nullable=True)
    # Provide hashed_password synonym for backward compatibility with existing code
    hashed_password = synonym('mot_de_passe')

    telephone = Column(String(30), nullable=True)
    adresse = Column(Text, nullable=True)
    date_naissance = Column(Date, nullable=True)
    statut = Column(STATUT_USER, nullable=True)
    date_generation = Column(DateTime, default=datetime.datetime.utcnow)
    date_mise_a_jour = Column(DateTime, nullable=True)
    photo_url = Column(String(500), nullable=True)
    date_derniere_connexion = Column(DateTime, nullable=True)
    
    role_id = Column(BigInteger, ForeignKey("bioscan.role.role_id"), nullable=True)
    
    # Relationship with Role table
    role_obj = relationship("Role", foreign_keys=[role_id], viewonly=True)

    # Relation avec CodeOTP
    otps = relationship(
        "CodeOTP",
        back_populates="utilisateur",
        cascade="all, delete-orphan"
    )


# ---- Fonctions utilitaires ----

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_by_email(db, email: str):
    return db.query(Utilisateur).filter(Utilisateur.email == email).first()
