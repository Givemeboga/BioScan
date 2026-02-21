from sqlalchemy import Column, BigInteger, String, Text
from database import Base


class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = {"schema": "bioscan"}

    permission_id = Column(BigInteger, primary_key=True, index=True)
    nom_permission = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
