from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
# Routers
from api.routers.bilan_biologique import router as bilan_router
from api.routers.profil import router as profil_router
from api.routers.Technicien import router as technicien_router
# Base de données
from database import engine, Base

app = FastAPI(
    title="BioScan API",
    description="API pour la plateforme BioScan",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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

# Inclusion des routers
app.include_router(bilan_router, prefix="/api")
app.include_router(profil_router, prefix="/api")
app.include_router(technicien_router, prefix="/api")

@app.get("/", tags=["Root"])
def root():
    return {"message": "🚀 API BioScan opérationnelle – Auth sur /api/auth/login"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "OK"}


app.mount("/static", StaticFiles(directory="static"), name="static")
