from sqlalchemy import Column, BigInteger, String, Text
from sqlalchemy.orm import relationship
from database import Base

class Role(Base):
    __tablename__ = "role"

    role_id = Column(BigInteger, primary_key=True, index=True)
    nom = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    # relation inverse
    utilisateurs = relationship("Utilisateur", back_populates="role")
