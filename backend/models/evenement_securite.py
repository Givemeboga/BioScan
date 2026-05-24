from sqlalchemy import Column, Integer, String, DateTime
import datetime

from database import Base


class EvenementSecurite(Base):
    __tablename__ = "evenement_securite"
    __table_args__ = {"schema": "bioscan"}

    evenement_id = Column(Integer, primary_key=True)
    utilisateur_id = Column(Integer)  # Reference to utilisateur without explicit FK
    type_evenement = Column(String)
    date_connexion = Column(DateTime, default=datetime.datetime.utcnow)
    ip = Column(String, nullable=True)
    agent_utilisateur = Column(String, nullable=True)
    status = Column(String, nullable=True)
