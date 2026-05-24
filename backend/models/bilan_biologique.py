# ===== models/bilan_biologique.py =====
from sqlalchemy import Column, BigInteger, String, TIMESTAMP, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum
from models.rapport_anomalie import RapportAnomalie
# Enum compatible avec votre schéma PostgreSQL
class StatutDocument(str, enum.Enum):
    BROUILLON = "BROUILLON"
    EN_COURS = "EN_COURS"
    VALIDE = "VALIDE"
    REJETE = "REJETE"
    ARCHIVE = "ARCHIVE"

class BilanBiologique(Base):
    __tablename__ = "bilan_biologique"
    __table_args__ = {"schema": "bioscan"}

    bilan_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    statut = Column(
        Enum(StatutDocument),
        nullable=False,
        default=StatutDocument.BROUILLON
    )

    type = Column(String(100), nullable=False)  # 'Sang', 'Urine', etc.
    nom_fichier = Column(String, nullable=True)  # 'bilan_sang_001.pdf'

    date_generation = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )

    # Relations Foreign Keys
    patient_id = Column(
        BigInteger,
        ForeignKey("bioscan.patient.patient_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    technicien_id = Column(
        BigInteger,
        ForeignKey("technicien_biologiste.technicien_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    medecin_id = Column(
        BigInteger,
        ForeignKey("bioscan.medecin_biologiste.medecin_id", ondelete="SET NULL"),
        nullable=True
    )

    # Relations bidirectionnelles
    patient = relationship(
        "Patient",
        back_populates="bilans",
        foreign_keys=[patient_id]
    )
    technicien = relationship(
        "TechnicienBiologiste",
        back_populates="bilans",
        foreign_keys=[technicien_id]
    )
    medecin = relationship("MedecinBiologiste", back_populates="bilans")
    rapports_anomalie = relationship(
        "RapportAnomalie",
        back_populates="bilan",
        cascade="all, delete-orphan"
    )

    # Métadonnées supplémentaires
    date_mise_a_jour = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )
