from sqlalchemy import Column, BigInteger, ForeignKey, String, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime

REPORT_STATUT = Enum('BROUILLON', 'EN_COURS', 'VALIDE', 'REJETE', 'ARCHIVE', name='statut_document', schema='bioscan')


class RapportMedical(Base):
    __tablename__ = "rapport_medical"
    __table_args__ = {"schema": "bioscan"}

    rapport_medical_id = Column(BigInteger, primary_key=True, index=True)
    statut = Column(REPORT_STATUT, nullable=True)
    date_generation = Column(DateTime, default=datetime.datetime.utcnow)
    date_validation = Column(DateTime, nullable=True)
    bilan_id = Column(BigInteger, ForeignKey("bioscan.bilan_biologique.bilan_id"), nullable=True)
    patient_id = Column(BigInteger, ForeignKey("bioscan.patient.patient_id"), nullable=True)
    medecin_id = Column(BigInteger, ForeignKey("bioscan.medecin_biologiste.medecin_id"), nullable=True)

    # relationships omitted for brevity
