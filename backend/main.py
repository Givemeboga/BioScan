import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Add backend directory to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Routers
from api.routers.auth import router as auth_router
from api.routers.bilan_biologique import router as bilan_router
from api.routers.profil import router as profil_router
from api.routers.Profil1 import router as profil_router1
from api.routers.forgot_password import router as forgot_password_router
from api.routers.otp import router as otp_router
from api.routers.admin_users import router as admin_users_router
from api.routers.admin_medecins import router as admin_medecins_router
from api.routers.admin_techniciens import router as admin_techniciens_router
from api.routers.admin_reports import router as admin_reports_router
from api.routers.admin_settings import router as admin_settings_router
from api.routers.admin_roles import router as admin_roles_router
from api.routers.admin_dashboard import router as admin_dashboard_router

# Base de données
from database import engine, Base

# Import all models so SQLAlchemy can create tables
from models.utilisateur import Utilisateur
from models.patient import Patient
from models.medecin import MedecinBiologiste
from models.technicien import TechnicienBiologiste
from models.role import Role
from models.code_otp import CodeOTP

# Basic logging config
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')

app = FastAPI(
    title="BioScan API",
    description="API pour la plateforme BioScan",
    version="1.0.0"
)

# Middleware CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crée automatiquement les tables manquantes (utile même avec Alembic en dev)
Base.metadata.create_all(bind=engine)

# Routes
app.include_router(auth_router, prefix="/api/auth")   # <- endpoint final: /api/auth/login
app.include_router(bilan_router, prefix="/api")
app.include_router(profil_router, prefix="/api/profil")
app.include_router(profil_router1, prefix="/api/profil1")
app.include_router(forgot_password_router, prefix="/api")
app.include_router(otp_router, prefix="/api")
app.include_router(admin_users_router)
app.include_router(admin_medecins_router)
app.include_router(admin_techniciens_router)
app.include_router(admin_reports_router)
app.include_router(admin_settings_router)
app.include_router(admin_roles_router)
app.include_router(admin_dashboard_router)

@app.get("/")
def root():
    return {"message": "🚀 API BioScan opérationnelle"}
