from sqlalchemy import Column, BigInteger, String, Boolean, Date, Enum, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext
import enum


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =========================
# ENUM PostgreSQL
# =========================
class StatutUser(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


# =========================
# MODELE UTILISATEUR
# =========================
class Utilisateur(Base):
    __tablename__ = "utilisateur"

    utilisateur_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nom_utilisateur = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe = Column(String, nullable=False)

    telephone = Column(String(30))
    adresse = Column(String)
    date_naissance = Column(Date)

    statut = Column(
        Enum(StatutUser, name="statut_user"),
        default=StatutUser.ACTIVE
    )

    date_generation = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    date_mise_a_jour = Column(
        TIMESTAMP,
        onupdate=func.now()
    )

    # Relations 1-1
    technicien = relationship("TechnicienBiologiste", back_populates="utilisateur", uselist=False)
    #medecin = relationship("MedecinBiologiste", back_populates="utilisateur", uselist=False)
    #patient = relationship("Patient", back_populates="utilisateur", uselist=False)
    #administrateur = relationship("Administrateur", back_populates="utilisateur", uselist=False)


# =========================
# PASSWORD HELPERS
# =========================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)
