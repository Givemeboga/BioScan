# backend/models/patient.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Patient(Base):
    __tablename__  = "patient"
    __table_args__ = {"schema": "bioscan"}  # ✅ schema cohérent

    patient_id     = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ✅ FK avec schema complet
    utilisateur_id = Column(
        Integer,
        ForeignKey("bioscan.utilisateur.utilisateur_id"),
        nullable=False,
        unique=True,
    )

    actif            = Column(Boolean,     default=True)
    groupe_sanguin   = Column(String(5),   nullable=True)
    antecedents      = Column(String(500), nullable=True)
    allergies        = Column(String(500), nullable=True)
    medecin_traitant = Column(String(150), nullable=True)

    # ✅ Relation ORM
    utilisateur = relationship("Utilisateur", back_populates="patient")
    bilans = relationship("BilanBiologique", back_populates="patient")

    def __repr__(self):
        return f"<Patient id={self.patient_id} utilisateur_id={self.utilisateur_id}>"