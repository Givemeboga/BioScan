from sqlalchemy import Column, BigInteger, ForeignKey
from database import Base
from sqlalchemy.orm import relationship


class Administrateur(Base):
    __tablename__ = "administrateur"
    __table_args__ = {"schema": "bioscan"}

    administrateur_id = Column(BigInteger, primary_key=True, index=True)
    utilisateur_id = Column(BigInteger, ForeignKey("bioscan.utilisateur.utilisateur_id"), unique=True)

    utilisateur = relationship("Utilisateur", backref="administrateur")
