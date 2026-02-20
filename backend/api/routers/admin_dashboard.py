from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.utilisateur import Utilisateur
from models.report import RapportMedical
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/stats", tags=["Admin Dashboard"])


@router.get("/overview")
async def overview(db: Session = Depends(get_db)):
    total_users = db.query(Utilisateur).count()
    active_accounts = db.query(Utilisateur).filter(Utilisateur.statut == 'ACTIVE').count()
    signalements = 0
    rapports_generes = db.query(RapportMedical).count()
    return {"totalUsers": total_users, "activeAccounts": active_accounts, "signalements": signalements, "rapportsGeneres": rapports_generes}


@router.get("/accounts-monthly")
async def accounts_monthly(db: Session = Depends(get_db)):
    # Simple placeholder: return counts grouped by month using created_at
    rows = db.query(func.date_trunc('month', Utilisateur.date_generation), func.count(Utilisateur.utilisateur_id)).group_by(func.date_trunc('month', Utilisateur.date_generation)).all()
    return {"monthly": [{"month": str(r[0]), "count": int(r[1])} for r in rows]}


@router.get("/account-status")
async def account_status(db: Session = Depends(get_db)):
    rows = db.query(Utilisateur.statut, func.count(Utilisateur.utilisateur_id)).group_by(Utilisateur.statut).all()
    return {"statusBreakdown": {str(r[0]): int(r[1]) for r in rows}}
