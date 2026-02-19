from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.bilan_biologique import router as bilan_router
from api.routers.profil import router as profil_router
from api.routers.Profil1 import router as profil_router1
from api.routers.auth import router as auth_router
from api.routers.forgot_password import router as forgot_password_router
from api.routers.otp import router as otp_router
app = FastAPI(
    title="BioScan API",
    description="API pour la plateforme BioScan",
    version="1.0.0"
)

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

app.include_router(bilan_router, prefix="/api")
app.include_router(profil_router, prefix="/api")
app.include_router(profil_router1, prefix="/api")
app.include_router(auth_router, prefix="/auth")
app.include_router(forgot_password_router)
app.include_router(otp_router)
@app.get("/")
def root():
    return {"message": "🚀 API BioScan opérationnelle"}
