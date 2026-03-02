from sqlalchemy import Column, BigInteger, String, Text, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class StatutNotification(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(BigInteger, primary_key=True, index=True)

    description = Column(Text, nullable=False)
    titre = Column(String(255), nullable=False)

    statut = Column(
        Enum(StatutNotification, name="statut_notification"),
        default=StatutNotification.UNREAD,
        nullable=False
    )

    date_generation = Column(TIMESTAMP, default=datetime.utcnow)
    date_mise_a_jour = Column(TIMESTAMP, default=datetime.utcnow)

    utilisateur_id = Column(BigInteger, ForeignKey("utilisateur.utilisateur_id"))

    utilisateur = relationship("Utilisateur")