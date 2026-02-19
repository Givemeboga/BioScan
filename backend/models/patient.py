from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class Patient(Base):
    __tablename__ = "patient"

    patient_id = Column(Integer, primary_key=True, index=True)
    utilisateur_id = Column(Integer, ForeignKey("utilisateur.utilisateur_id"), nullable=False)
