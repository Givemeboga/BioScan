# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import os, sys, logging
from api.routers.otp import router as otp_router

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)

MEDIA_DIR   = os.path.join(BASE_DIR, "media")
PHOTOS_DIR  = os.path.join(MEDIA_DIR, "photos")
AVATARS_DIR = os.path.join(MEDIA_DIR, "avatars")

os.makedirs(PHOTOS_DIR,  exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)

logger.info("[main] BASE_DIR    = %s", BASE_DIR)
logger.info("[main] MEDIA_DIR   = %s", MEDIA_DIR)
logger.info("[main] PHOTOS_DIR  = %s", PHOTOS_DIR)
logger.info("[main] AVATARS_DIR = %s", AVATARS_DIR)

app = FastAPI(
    title="BioScan API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  "http://127.0.0.1:3000",
        "http://localhost:3001",  "http://127.0.0.1:3001",
        "http://localhost:5173",  "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# ── Base de données : NE PAS importer les modèles avec relations ORM ──────────
# Les modèles avec relationship() causent l'erreur "role table not found"
# On utilise SQL pur dans tous les routers → pas besoin de Base.metadata.create_all
from database import engine, Base

# ⚠️  Importer UNIQUEMENT les modèles sans relation role
# Si vos modèles ont relationship(Role), commentez ces imports
# from models.utilisateur import Utilisateur
# from models.role import Role

# ── Routers ──────────────────────────────────────────────────────────────────
from api.routers.auth               import router as auth_router
from api.routers.otp                import router as otp_router
from api.routers.forgot_password    import router as forgot_password_router
from api.routers.bilan_biologique   import router as bilan_router
from api.routers.profil_patient     import router as profil_patient_router
from api.routers.profil_medecin     import router as profil_medecin_router
from api.routers.Notification       import router as notifications_router
from api.routers.dashboard_patient  import router as dashboard_patient_router
from api.routers.rapport_medical    import router as rapport_router
from api.routers.parametres         import router as parametres_router

# Routers admin
from api.routers.admin_users        import router as admin_users_router
from api.routers.admin_medecins     import router as admin_medecins_router
from api.routers.admin_techniciens  import router as admin_techniciens_router
from api.routers.admin_reports      import router as admin_reports_router
from api.routers.admin_settings     import router as admin_settings_router
from api.routers.admin_roles        import router as admin_roles_router
from api.routers.admin_dashboard    import router as admin_dashboard_router

# Routers profil legacy (si vous en avez besoin)
try:
    from api.routers.profil  import router as profil_router
    from api.routers.Profil1 import router as profil_router1
    app.include_router(profil_router,  prefix="/api/profil")
    app.include_router(profil_router1, prefix="/api/profil1")
except ImportError:
    logger.warning("[main] profil/Profil1 router non trouvé, ignoré")

# ── Inclusion des routers ─────────────────────────────────────────────────────
app.include_router(auth_router,              prefix="/api/auth")
app.include_router(otp_router,               prefix="/api")
app.include_router(forgot_password_router,   prefix="/api")
app.include_router(bilan_router,             prefix="/api")

# ✅ Prefixes corrigés — correspondent aux prefixes internes des routers
app.include_router(profil_patient_router,    prefix="/api")   # router interne: /patient/profil → /api/patient/profil
app.include_router(profil_medecin_router,    prefix="/api")   # router interne: /profil        → /api/profil
app.include_router(notifications_router,     prefix="/api")   # router interne: /notifications → /api/notifications
app.include_router(dashboard_patient_router, prefix="/api")   # router interne: /dashboard-patient → /api/dashboard-patient
app.include_router(rapport_router,           prefix="/api")
app.include_router(parametres_router,        prefix="/api")
app.include_router(otp_router, prefix="/api")

app.include_router(admin_users_router,       prefix="/api/admin/users")
app.include_router(admin_medecins_router,    prefix="/api/admin/medecins")
app.include_router(admin_techniciens_router, prefix="/api/admin/techniciens")
app.include_router(admin_reports_router,     prefix="/api/admin/reports")
app.include_router(admin_settings_router,    prefix="/api/admin/settings")
app.include_router(admin_roles_router,       prefix="/api/admin/roles")
app.include_router(admin_dashboard_router,   prefix="/api/admin/dashboard")

@app.get("/", tags=["Root"])
def root():
    return {"message": "🚀 API BioScan opérationnelle", "docs": "/docs", "time": datetime.utcnow().isoformat()}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}