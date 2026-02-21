from fastapi import APIRouter
from schemas.settings import SettingsRead, SecuritySettings, AISettings, NotificationSettings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/settings", tags=["Admin Settings"])

# Simple in-memory settings store for demonstration; in prod persist to DB
_SETTINGS = {
    "security": {
        "otpExpiration": 300,
        "passwordMinLength": 8,
        "sessionTimeout": 3600,
        "failedLoginLimit": 5,
        "requireUppercase": True,
        "requireNumbers": True,
        "requireSpecialChars": False,
    },
    "ai": {"aiEnabled": False, "aiVersion": "1.0", "analysisTypes": ["hb", "cbc"]},
    "notifications": {"smsEnabled": False, "emailEnabled": True, "systemAlerts": True},
}


@router.get("", response_model=SettingsRead)
async def get_settings():
    # Parse the stored dicts into Pydantic models for a proper response
    security = SecuritySettings.model_validate(_SETTINGS["security"]) if hasattr(SecuritySettings, 'model_validate') else SecuritySettings(**_SETTINGS["security"])
    ai = AISettings.model_validate(_SETTINGS["ai"]) if hasattr(AISettings, 'model_validate') else AISettings(**_SETTINGS["ai"])
    notifications = NotificationSettings.model_validate(_SETTINGS["notifications"]) if hasattr(NotificationSettings, 'model_validate') else NotificationSettings(**_SETTINGS["notifications"])
    return SettingsRead(security=security, ai=ai, notifications=notifications)


@router.post("/security")
async def update_security(settings: SecuritySettings):
    # store using model_dump if available (pydantic v2), else dict()
    _SETTINGS["security"] = settings.model_dump() if hasattr(settings, 'model_dump') else settings.dict()
    logger.info("Updated security settings")
    return {"ok": True}


@router.post("/ai")
async def update_ai(settings: AISettings):
    _SETTINGS["ai"] = settings.model_dump() if hasattr(settings, 'model_dump') else settings.dict()
    logger.info("Updated AI settings")
    return {"ok": True}


@router.post("/notifications")
async def update_notifications(settings: NotificationSettings):
    _SETTINGS["notifications"] = settings.model_dump() if hasattr(settings, 'model_dump') else settings.dict()
    logger.info("Updated notification settings")
    return {"ok": True}
