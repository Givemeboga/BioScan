from pydantic import BaseModel
from typing import List, Optional


class SecuritySettings(BaseModel):
    otpExpiration: int
    passwordMinLength: int
    sessionTimeout: int
    failedLoginLimit: int
    requireUppercase: bool
    requireNumbers: bool
    requireSpecialChars: bool


class AISettings(BaseModel):
    aiEnabled: bool
    aiVersion: Optional[str]
    analysisTypes: Optional[List[str]] = []


class NotificationSettings(BaseModel):
    smsEnabled: bool
    emailEnabled: bool
    systemAlerts: bool


class SettingsRead(BaseModel):
    security: SecuritySettings
    ai: AISettings
    notifications: NotificationSettings

    class Config:
        orm_mode = True
