from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from schemas.medecin import MedecinCreate, MedecinRead, MedecinUpdate
from models.medecin import MedecinBiologiste
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/medecins", tags=["Admin Medecins"])


def _paginate_query(query, page: int, limit: int):
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)


@router.get("", response_model=List[MedecinRead])
async def list_medecins(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(MedecinBiologiste)
    if search:
        like_q = f"%{search}%"
        # naive search via join on utilisateur if available
        try:
            query = query.join(MedecinBiologiste.utilisateur).filter(MedecinBiologiste.utilisateur.property.mapper.class_.nom_utilisateur.ilike(like_q))
        except Exception:
            # fallback: ignore join when relationship metadata isn't available
            pass
    if status:
        # status not present on model directly
        pass

    medecins = _paginate_query(query, page, limit).all()
    result = []
    for m in medecins:
        utilisateur = getattr(m, 'utilisateur', None)
        nom = getattr(utilisateur, 'nom_utilisateur', None) if utilisateur else None
        email = getattr(utilisateur, 'email', None) if utilisateur else None
        result.append(MedecinRead(id=int(m.medecin_id), nom=nom, specialite=None, email=email, telephone=(getattr(utilisateur, 'telephone', None) if utilisateur else None), utilisateurId=(int(m.utilisateur_id) if m.utilisateur_id is not None else None), rapportsValides=0, status=None, dateInscription=None, derniereActivite=None))
    logger.info("Listed medecins", extra={"count": len(result)})
    return result


@router.post("", response_model=MedecinRead, status_code=status.HTTP_201_CREATED)
async def create_medecin(m_in: MedecinCreate, db: Session = Depends(get_db)):
    now = datetime.datetime.now(datetime.timezone.utc)
    med = MedecinBiologiste(utilisateur_id=m_in.utilisateurId)
    db.add(med)
    db.commit()
    db.refresh(med)
    logger.info("Created medecin", extra={"medecin_id": int(med.medecin_id)})
    utilisateur = getattr(med, 'utilisateur', None)
    nom = getattr(utilisateur, 'nom_utilisateur', None) if utilisateur else None
    email = getattr(utilisateur, 'email', None) if utilisateur else None
    telephone = getattr(utilisateur, 'telephone', None) if utilisateur else None
    return MedecinRead(id=int(med.medecin_id), nom=nom, specialite=m_in.specialite, email=email, telephone=telephone, utilisateurId=(int(med.utilisateur_id) if med.utilisateur_id is not None else None), rapportsValides=0, status=None, dateInscription=now, derniereActivite=None)


@router.put("/{medecin_id}", response_model=MedecinRead)
async def update_medecin(medecin_id: int, m_in: MedecinUpdate, db: Session = Depends(get_db)):
    med = db.query(MedecinBiologiste).filter(MedecinBiologiste.medecin_id == medecin_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medecin not found")
    utilisateur = getattr(med, 'utilisateur', None)
    if utilisateur:
        if m_in.nom:
            utilisateur.nom_utilisateur = m_in.nom
        if m_in.email:
            utilisateur.email = m_in.email
        if m_in.telephone:
            utilisateur.telephone = m_in.telephone
    db.commit()
    db.refresh(med)
    utilisateur = getattr(med, 'utilisateur', None)
    nom = getattr(utilisateur, 'nom_utilisateur', None) if utilisateur else None
    email = getattr(utilisateur, 'email', None) if utilisateur else None
    telephone = getattr(utilisateur, 'telephone', None) if utilisateur else None
    return MedecinRead(id=int(med.medecin_id), nom=nom, specialite=m_in.specialite, email=email, telephone=telephone, utilisateurId=(int(med.utilisateur_id) if med.utilisateur_id is not None else None), rapportsValides=0, status=None, dateInscription=None, derniereActivite=None)


@router.delete("/{medecin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medecin(medecin_id: int, db: Session = Depends(get_db)):
    med = db.query(MedecinBiologiste).filter(MedecinBiologiste.medecin_id == medecin_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medecin not found")
    db.delete(med)
    db.commit()
    logger.info("Deleted medecin", extra={"medecin_id": medecin_id})
    return


@router.patch("/{medecin_id}/status", response_model=MedecinRead)
async def patch_medecin_status(medecin_id: int, status: str, db: Session = Depends(get_db)):
    med = db.query(MedecinBiologiste).filter(MedecinBiologiste.medecin_id == medecin_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medecin not found")
    # status not stored on model; left for future extension
    logger.info("Patched medecin status", extra={"medecin_id": medecin_id, "status": status})
    utilisateur = getattr(med, 'utilisateur', None)
    nom = getattr(utilisateur, 'nom_utilisateur', None) if utilisateur else None
    email = getattr(utilisateur, 'email', None) if utilisateur else None
    telephone = getattr(utilisateur, 'telephone', None) if utilisateur else None
    return MedecinRead(id=int(med.medecin_id), nom=nom, specialite=None, email=email, telephone=telephone, utilisateurId=(int(med.utilisateur_id) if med.utilisateur_id is not None else None), rapportsValides=0, status=status, dateInscription=None, derniereActivite=None)
