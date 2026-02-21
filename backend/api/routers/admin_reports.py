from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from schemas.report import ReportRead
from models.report import RapportMedical
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])


def _paginate_query(query, page: int, limit: int):
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)


@router.get("", response_model=List[ReportRead])
async def list_reports(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    medecin: Optional[str] = Query(None),
    dateFilter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(RapportMedical)
    if status:
        query = query.filter(RapportMedical.statut == status)
    if type:
        # type not currently captured; left for extension
        pass
    reports = _paginate_query(query, page, limit).all()
    result = []
    for r in reports:
        result.append(ReportRead(id=r.rapport_medical_id, type=None, titre=None, medecinId=r.medecin_id, patientId=r.patient_id, status=r.statut, dateCreation=r.date_generation, dateValidation=r.date_validation))
    return result


@router.get("/stats")
async def report_stats(db: Session = Depends(get_db)):
    total_medical = db.query(RapportMedical).filter(RapportMedical.statut != None).count()
    # For demo purposes, treat all as medical
    total_anomalie = 0
    status_counts = db.query(RapportMedical.statut, func.count(RapportMedical.rapport_medical_id)).group_by(RapportMedical.statut).all()
    # Convert list of tuples into dict safely
    status_dict = {str(k): int(v) for k, v in status_counts}
    return {"totalMedical": total_medical, "totalAnomalie": total_anomalie, "statusCounts": status_dict}


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(RapportMedical).filter(RapportMedical.rapport_medical_id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(rep)
    db.commit()
    logger.info("Deleted report", extra={"report_id": report_id})
    return
