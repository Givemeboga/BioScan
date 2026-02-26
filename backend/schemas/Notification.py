# schemas/notification.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class NotificationOut(BaseModel):
    notification_id:  Optional[int]      = None
    titre:            Optional[str]      = None
    description:      Optional[str]      = None
    statut:           Optional[str]      = Field(default="UNREAD")
    date_generation:  Optional[datetime] = None
    date_mise_a_jour: Optional[datetime] = None
    utilisateur_id:   Optional[int]      = None

    model_config = {"from_attributes": True}


# Alias utilisé par le router
NotificationList = NotificationOut


class NotificationCreate(BaseModel):
    titre:          Optional[str] = Field(None, max_length=255)
    description:    Optional[str] = None
    utilisateur_id: Optional[int] = None