from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patient"
    __table_args__ = {"schema": "bioscan"}

    patient_id = Column(Integer, primary_key=True, index=True)
    utilisateur_id = Column(Integer, ForeignKey("bioscan.utilisateur.utilisateur_id"), nullable=False)
    
    utilisateur = relationship("Utilisateur", backref="patient")
