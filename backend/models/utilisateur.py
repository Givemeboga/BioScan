from sqlalchemy import Column, BigInteger, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    utilisateur_id = Column(BigInteger, primary_key=True, index=True)
    nom_utilisateur = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe = Column(String, nullable=False)
    telephone = Column(String(30), nullable=True)
    adresse = Column(String, nullable=True)
    date_naissance = Column(Date, nullable=True)
    statut = Column(String, default="ACTIVE")
    date_generation = Column(DateTime, default=datetime.utcnow)
    date_mise_a_jour = Column(DateTime, default=datetime.utcnow)

    role_id = Column(BigInteger, ForeignKey("role.role_id"))
    role = relationship("Role", back_populates="utilisateurs")

    # Relation avec CodeOTP
    otps = relationship(
        "CodeOTP",
        back_populates="utilisateur",
        cascade="all, delete-orphan"
    )


# ---------------------------
# Fonctions utilitaires
# ---------------------------
def get_password_hash(password: str):
    # Limite de 72 caractères pour bcrypt
    return pwd_context.hash(password[:72])


def get_user_by_email(db, email: str):
    return db.query(Utilisateur).filter(Utilisateur.email == email).first()
