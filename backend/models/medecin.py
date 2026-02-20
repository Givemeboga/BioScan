from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class MedecinBiologiste(Base):
    __tablename__ = "medecin_biologiste"
    __table_args__ = {"schema": "bioscan"}

    medecin_id = Column(BigInteger, primary_key=True, index=True)
    utilisateur_id = Column(BigInteger, ForeignKey("bioscan.utilisateur.utilisateur_id"), unique=True)

    utilisateur = relationship("Utilisateur", backref="medecin")
