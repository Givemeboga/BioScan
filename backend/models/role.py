from sqlalchemy import Column, BigInteger, String, Text
from database import Base


class Role(Base):
    __tablename__ = "role"
    __table_args__ = {"schema": "bioscan"}

    role_id = Column(BigInteger, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
