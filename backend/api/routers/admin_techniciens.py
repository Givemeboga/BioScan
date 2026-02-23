from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from schemas.technicien import TechnicienCreate, TechnicienRead, TechnicienUpdate
from models.technicien import TechnicienBiologiste
import logging
import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/techniciens", tags=["Admin Techniciens"])


def _paginate_query(query, page: int, limit: int):
    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)


@router.get("", response_model=List[TechnicienRead])
async def list_techniciens(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    from models.utilisateur import Utilisateur
    from models.role import Role
    
    # Query users with "Technicien biologiste" role
    query = db.query(Utilisateur).join(Role).filter(Role.nom == 'Technicien biologiste')
    
    if search:
        like_q = f"%{search}%"
        query = query.filter(
            Utilisateur.nom_utilisateur.ilike(like_q) |
            Utilisateur.email.ilike(like_q)
        )
    
    if status:
        query = query.filter(Utilisateur.statut == status)

    users = _paginate_query(query, page, limit).all()
    result = []
    
    for u in users:
        # Try to get corresponding technicien_biologiste record
        technicien = db.query(TechnicienBiologiste).filter(
            TechnicienBiologiste.utilisateur_id == u.utilisateur_id
        ).first()
        
        result.append(TechnicienRead(
            id=int(technicien.technicien_id) if technicien else int(u.utilisateur_id),
            nom=u.nom_utilisateur,
            departement=None,
            email=u.email,
            telephone=u.telephone,
            utilisateurId=int(u.utilisateur_id),
            bilansTraites=0,
            analysesIA=0,
            rapportsCrees=0,
            status=str(u.statut) if u.statut else None,
            dateInscription=u.date_generation if u.date_generation else None,
            derniereActivite=u.date_derniere_connexion if u.date_derniere_connexion else None,
            tempsTraitementMoyen=None,
            bilansEnAttente=None
        ))
    
    logger.info("Listed techniciens", extra={"count": len(result)})
    return result


@router.post("", response_model=TechnicienRead, status_code=status.HTTP_201_CREATED)
async def create_technicien(t_in: TechnicienCreate, db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    tech = TechnicienBiologiste(utilisateur_id=t_in.utilisateurId)
    db.add(tech)
    db.commit()
    db.refresh(tech)
    utilisateur = getattr(tech, 'utilisateur', None)
    logger.info("Created technicien", extra={"technicien_id": tech.technicien_id})
    return TechnicienRead(
        id=int(tech.technicien_id),
        nom=utilisateur.nom_utilisateur if utilisateur else None,
        departement=t_in.departement,
        email=utilisateur.email if utilisateur else None,
        telephone=utilisateur.telephone if utilisateur else None,
        utilisateurId=int(tech.utilisateur_id),
        bilansTraites=0,
        analysesIA=0,
        rapportsCrees=0,
        status=str(utilisateur.statut) if utilisateur and utilisateur.statut else None,
        dateInscription=utilisateur.date_generation if utilisateur else None,
        derniereActivite=utilisateur.date_derniere_connexion if utilisateur else None,
        tempsTraitementMoyen=None,
        bilansEnAttente=None
    )


@router.put("/{technicien_id}", response_model=TechnicienRead)
async def update_technicien(technicien_id: int, t_in: TechnicienUpdate, db: Session = Depends(get_db)):
    tech = db.query(TechnicienBiologiste).filter(TechnicienBiologiste.technicien_id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    utilisateur = getattr(tech, 'utilisateur', None)
    if utilisateur:
        if t_in.nom:
            utilisateur.nom_utilisateur = t_in.nom
        if t_in.email:
            utilisateur.email = t_in.email
        if t_in.telephone:
            utilisateur.telephone = t_in.telephone
    db.commit()
    db.refresh(tech)
    utilisateur = getattr(tech, 'utilisateur', None)
    return TechnicienRead(
        id=int(tech.technicien_id),
        nom=utilisateur.nom_utilisateur if utilisateur else None,
        departement=t_in.departement,
        email=utilisateur.email if utilisateur else None,
        telephone=utilisateur.telephone if utilisateur else None,
        utilisateurId=int(tech.utilisateur_id),
        bilansTraites=0,
        analysesIA=0,
        rapportsCrees=0,
        status=str(utilisateur.statut) if utilisateur and utilisateur.statut else None,
        dateInscription=utilisateur.date_generation if utilisateur else None,
        derniereActivite=utilisateur.date_derniere_connexion if utilisateur else None,
        tempsTraitementMoyen=None,
        bilansEnAttente=None
    )


@router.delete("/{technicien_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technicien(technicien_id: int, db: Session = Depends(get_db)):
    tech = db.query(TechnicienBiologiste).filter(TechnicienBiologiste.technicien_id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    db.delete(tech)
    db.commit()
    logger.info("Deleted technicien", extra={"technicien_id": technicien_id})
    return


@router.patch("/{technicien_id}/status", response_model=TechnicienRead)
async def patch_technicien_status(technicien_id: int, status: str, db: Session = Depends(get_db)):
    tech = db.query(TechnicienBiologiste).filter(TechnicienBiologiste.technicien_id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    # status not stored on model currently
    logger.info("Patched technicien status", extra={"technicien_id": technicien_id, "status": status})
    utilisateur = getattr(tech, 'utilisateur', None)
    return TechnicienRead(id=tech.technicien_id, nom=utilisateur.nom_utilisateur if utilisateur else None, departement=None, email=utilisateur.email if utilisateur else None, telephone=utilisateur.telephone if utilisateur else None, utilisateurId=tech.utilisateur_id)
