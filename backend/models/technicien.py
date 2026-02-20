from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class TechnicienBiologiste(Base):
    __tablename__ = "technicien_biologiste"
    __table_args__ = {"schema": "bioscan"}

    technicien_id = Column(BigInteger, primary_key=True, index=True)
    utilisateur_id = Column(BigInteger, ForeignKey("bioscan.utilisateur.utilisateur_id"), unique=True)

    utilisateur = relationship("Utilisateur", backref="technicien")
