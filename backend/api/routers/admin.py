# api/routers/admin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from models.utilisateur import Utilisateur

router = APIRouter(prefix="/admin", tags=["admin"])


# ==================== GET /api/admin/dashboard/stats ====================
@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    try:
        total_users = db.query(func.count(Utilisateur.id)).scalar() or 0
        active_accounts = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.is_active == True
        ).scalar() or 0
        
        # Count flagged accounts if the column exists on the model
        if hasattr(Utilisateur, "is_flagged"):
            try:
                flagged_accounts = db.query(func.count(Utilisateur.id)).filter(
                    Utilisateur.is_flagged == True
                ).scalar() or 0
            except Exception:
                flagged_accounts = 0
        else:
            flagged_accounts = 0

        # Count reports - attempt to import Report model if present
        try:
            from models.report import Report  # optional model
            total_reports = db.query(func.count(Report.id)).scalar() or 0
        except Exception:
            total_reports = 0

        return {
            "total_users": total_users,
            "active_accounts": active_accounts,
            "flagged_accounts": flagged_accounts,
            "total_reports": total_reports,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/dashboard/monthly-accounts ====================
@router.get("/dashboard/monthly-accounts")
def get_monthly_accounts(db: Session = Depends(get_db)):
    """Get monthly account creation and deactivation data for last 6 months"""
    try:
        months_data = []
        created_data = []
        deactivated_data = []
        
        # Get last 6 months of data
        for i in range(5, -1, -1):
            month_date = datetime.now() - timedelta(days=30*i)
            month_label = month_date.strftime("%b")
            
            # If the model has a created_at column, try to count records created in that month
            created = 0
            deactivated = 0
            if hasattr(Utilisateur, "created_at"):
                try:
                    start = month_date.replace(day=1)
                    # approximate end: add 31 days and truncate to month start
                    end = (start + timedelta(days=31)).replace(day=1)
                    created = db.query(func.count(Utilisateur.id)).filter(
                        Utilisateur.created_at >= start,
                        Utilisateur.created_at < end,
                    ).scalar() or 0
                except Exception:
                    created = 0

            months_data.append(month_label)
            created_data.append(created)
            deactivated_data.append(deactivated)
        
        return {
            "labels": months_data,
            "created": created_data,
            "deactivated": deactivated_data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/dashboard/account-status ====================
@router.get("/dashboard/account-status")
def get_account_status(db: Session = Depends(get_db)):
    """Get account status distribution"""
    try:
        active = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.is_active == True
        ).scalar() or 0
        
        inactive = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.is_active == False
        ).scalar() or 0
        
        # Assuming roles represent different statuses
        medecin = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.role == "medecin"
        ).scalar() or 0
        
        technicien = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.role == "technicien"
        ).scalar() or 0
        
        return {
            "labels": ["Actifs", "Inactifs", "Medecins", "Techniciens"],
            "data": [active, inactive, medecin, technicien],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/users ====================
@router.get("/users")
def get_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get paginated list of all users"""
    try:
        users = db.query(Utilisateur).offset(skip).limit(limit).all()
        total = db.query(func.count(Utilisateur.id)).scalar() or 0
        
        return {
            "data": [
                {
                    "id": u.id,
                    "nom_utilisateur": u.nom_utilisateur,
                    "email": u.email,
                    "role": u.role,
                    "specialite": u.specialite,
                    "telephone": u.telephone,
                    "is_active": u.is_active,
                }
                for u in users
            ],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/medecins ====================
@router.get("/medecins")
def get_doctors(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get paginated list of doctors (medecins)"""
    try:
        doctors = db.query(Utilisateur).filter(
            Utilisateur.role == "medecin"
        ).offset(skip).limit(limit).all()
        
        total = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.role == "medecin"
        ).scalar() or 0
        
        return {
            "data": [
                {
                    "id": d.id,
                    "nom_utilisateur": d.nom_utilisateur,
                    "email": d.email,
                    "specialite": d.specialite,
                    "telephone": d.telephone,
                    "is_active": d.is_active,
                }
                for d in doctors
            ],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/techniciens ====================
@router.get("/techniciens")
def get_technicians(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get paginated list of technicians (techniciens)"""
    try:
        technicians = db.query(Utilisateur).filter(
            Utilisateur.role == "technicien"
        ).offset(skip).limit(limit).all()
        
        total = db.query(func.count(Utilisateur.id)).filter(
            Utilisateur.role == "technicien"
        ).scalar() or 0
        
        return {
            "data": [
                {
                    "id": t.id,
                    "nom_utilisateur": t.nom_utilisateur,
                    "email": t.email,
                    "telephone": t.telephone,
                    "is_active": t.is_active,
                }
                for t in technicians
            ],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/reports ====================
@router.get("/reports")
def get_reports(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get paginated list of reports"""
    try:
        # Note: Implement when you have a Report model
        # For now, return empty data
        return {
            "data": [],
            "total": 0,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GET /api/admin/stats/by-role ====================
@router.get("/stats/by-role")
def get_stats_by_role(db: Session = Depends(get_db)):
    """Get user statistics grouped by role"""
    try:
        roles = db.query(
            Utilisateur.role,
            func.count(Utilisateur.id).label("count")
        ).group_by(Utilisateur.role).all()
        
        return {
            "data": [
                {"role": role, "count": count}
                for role, count in roles
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
