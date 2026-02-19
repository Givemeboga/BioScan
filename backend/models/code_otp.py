from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum


class StatutOTP(enum.Enum):
    ACTIF = "ACTIF"
    UTILISE = "UTILISE"
    EXPIRE = "EXPIRE"


class CodeOTP(Base):
    __tablename__ = "code_otp"

    otp_id = Column(BigInteger, primary_key=True, autoincrement=True)
    code_generer = Column(String(10), nullable=False)
    raison = Column(String(100))
    statut = Column(Enum(StatutOTP), default=StatutOTP.ACTIF)
    date_generation = Column(DateTime, default=datetime.datetime.utcnow)

    utilisateur_id = Column(BigInteger, ForeignKey("utilisateur.utilisateur_id"), nullable=False)
    utilisateur = relationship("Utilisateur", back_populates="otps")

    expiration = Column(DateTime, nullable=False)
