from sqlalchemy import Column, BigInteger, String, TIMESTAMP, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

# RAPPORT ANOMALIE
# =========================

class RapportAnomalie(Base):
    __tablename__ = "rapport_anomalie"

    rapport_anomalie_id = Column(BigInteger, primary_key=True, index=True)
    version = Column(String(50))
    statut = Column(String(50))
    type_anomalie = Column(String(255))
    date_generation = Column(TIMESTAMP)

    patient_id = Column(BigInteger, ForeignKey("patient.patient_id"))
    medecin_id = Column(BigInteger, ForeignKey("medecin_biologiste.medecin_id"))
    bilan_id = Column(BigInteger, ForeignKey("bilan_biologique.bilan_id"))

    # relation inverse
    bilan = relationship("BilanBiologique", back_populates="rapports_anomalie")