from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from database import Base


class RapportAnomalie(Base):
    __tablename__ = "rapport_anomalie"
    __table_args__ = {"schema": "bioscan"}

    rapport_id = Column(BigInteger, primary_key=True, index=True)
    bilan_id = Column(BigInteger, ForeignKey("bioscan.bilan_biologique.bilan_id"), nullable=False)
    description = Column(Text, nullable=True)
    severite = Column(String(20), nullable=True)
    valeur_mesuree = Column(String(100), nullable=True)
    valeur_normale = Column(String(100), nullable=True)
    marqueur = Column(String(100), nullable=True)
    date_generation = Column(DateTime, default=datetime.datetime.utcnow)

    bilan = relationship("BilanBiologique", foreign_keys=[bilan_id], viewonly=True)
