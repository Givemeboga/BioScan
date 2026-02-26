# backend/models/role.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class Role(Base):
    __tablename__  = "role"
    __table_args__ = {"schema": "bioscan"}  # ✅

    role_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom     = Column(String(50), unique=True, nullable=False)

    utilisateurs = relationship("Utilisateur", back_populates="role")

    def __repr__(self):
        return f"<Role id={self.role_id} nom={self.nom}>"