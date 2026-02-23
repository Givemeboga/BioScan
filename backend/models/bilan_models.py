from sqlalchemy import Column, BigInteger, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base


# =========================
# BILAN BIOLOGIQUE
# =========================

class BilanBiologique(Base):
    __tablename__ = "bilan_biologique"

    bilan_id = Column(BigInteger, primary_key=True, index=True)
    statut = Column(String(50))
    type = Column(String(100))
    nom_fichier = Column(Text)
    date_generation = Column(TIMESTAMP)

    patient_id = Column(BigInteger, ForeignKey("patient.patient_id"))
    technicien_id = Column(BigInteger, ForeignKey("technicien_biologiste.technicien_id"))

    # relation vers rapports anomalie
    rapports_anomalie = relationship("RapportAnomalie", back_populates="bilan")


# =========================
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
