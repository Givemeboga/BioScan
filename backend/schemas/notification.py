from pydantic import BaseModel
from datetime import datetime
from models.notification import StatutNotification


class NotificationSchema(BaseModel):
    notification_id: int
    description: str | None
    titre: str | None
    statut: StatutNotification
    date_generation: datetime | None
    date_mise_a_jour: datetime | None
    utilisateur_id: int | None

    class Config:
        orm_mode = True