# backend/models/utilisateur.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship, Session
from passlib.context import CryptContext
from database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Fonctions utilitaires ──────────────────────────────────────────────────
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


def get_user_by_email(db: Session, email: str) -> "Utilisateur | None":
    return (
        db.query(Utilisateur)
        .filter(Utilisateur.email == email.strip().lower())
        .first()
    )


def get_user_by_id(db: Session, user_id: int) -> "Utilisateur | None":
    return (
        db.query(Utilisateur)
        .filter(Utilisateur.utilisateur_id == user_id)
        .first()
    )


# ── Modèle ORM ─────────────────────────────────────────────────────────────
class Utilisateur(Base):
    __tablename__ = "utilisateur"

    utilisateur_id  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom_utilisateur = Column(String(100), nullable=True)
    email           = Column(String(150), unique=True, nullable=False, index=True)
    mot_de_passe    = Column(String(255), nullable=False)
    statut          = Column(String(20),  nullable=False, default="ACTIVE")

    # ✅ Champs supplémentaires utilisés à l'inscription
    telephone       = Column(String(20),  nullable=True)
    adresse         = Column(String(255), nullable=True)
    date_naissance  = Column(Date,        nullable=True)

    # FK + relation
    role_id = Column(Integer, ForeignKey("role.role_id"), nullable=True)
    role    = relationship("Role", back_populates="utilisateurs")

    def __repr__(self):
        return f"<Utilisateur id={self.utilisateur_id} email={self.email}>"