from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class TechnicienBiologiste(Base):
    __tablename__ = "technicien_biologiste"

    technicien_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    utilisateur_id = Column(
        BigInteger,
        ForeignKey("utilisateur.utilisateur_id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    # Relation 1-1 avec Utilisateur
    utilisateur = relationship(
        "Utilisateur",
        back_populates="technicien",
        uselist=False
    )
    bilans = relationship(
        "BilanBiologique",
        back_populates="technicien",
        foreign_keys="BilanBiologique.technicien_id"
    )
