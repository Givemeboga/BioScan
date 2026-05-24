from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from database import Base


class BilanBiologique(Base):
    __tablename__ = "bilan_biologique"
    __table_args__ = {"schema": "bioscan"}

    bilan_id = Column(BigInteger, primary_key=True, index=True)
    type = Column(String(100), nullable=True)
    statut = Column(String(50), nullable=True)
    nom_fichier = Column(String(255), nullable=True)
    date_generation = Column(DateTime, default=datetime.datetime.utcnow)
    date_validation = Column(DateTime, nullable=True)
    patient_id = Column(BigInteger, ForeignKey("bioscan.patient.patient_id"), nullable=True)
    technicien_id = Column(BigInteger, ForeignKey("bioscan.technicien_biologiste.technicien_id"), nullable=True)
    medecin_id = Column(BigInteger, ForeignKey("bioscan.medecin_biologiste.medecin_id"), nullable=True)

    patient = relationship("Patient", foreign_keys=[patient_id], viewonly=True)
    technicien = relationship("TechnicienBiologiste", foreign_keys=[technicien_id], viewonly=True)
    medecin = relationship("MedecinBiologiste", foreign_keys=[medecin_id], viewonly=True)
