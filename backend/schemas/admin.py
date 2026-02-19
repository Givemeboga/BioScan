from pydantic import BaseModel


class AdministrateurBase(BaseModel):
    utilisateur_id: int


class AdministrateurCreate(AdministrateurBase):
    pass


class AdministrateurRead(AdministrateurBase):
    administrateur_id: int

    class Config:
        orm_mode = True
