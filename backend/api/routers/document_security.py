from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

router = APIRouter(
    prefix="/document-security",
    tags=["document-security"],
)


@router.get("/events")
def list_security_events(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    rows = db.execute(
        text(
            """
            SELECT
                evenement_id,
                utilisateur_id,
                type_evenement,
                date_connexion,
                ip,
                agent_utilisateur,
                status
            FROM bioscan.evenement_securite
            ORDER BY date_connexion DESC NULLS LAST
            LIMIT :limit OFFSET :offset
            """
        ),
        {"limit": limit, "offset": offset},
    ).mappings().all()

    return [dict(row) for row in rows]


@router.get("/events/latest")
def latest_security_events(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100),
):
    rows = db.execute(
        text(
            """
            SELECT
                evenement_id,
                utilisateur_id,
                type_evenement,
                date_connexion,
                ip,
                agent_utilisateur,
                status
            FROM bioscan.evenement_securite
            ORDER BY date_connexion DESC NULLS LAST
            LIMIT :limit
            """
        ),
        {"limit": limit},
    ).mappings().all()

    return {"events": [dict(row) for row in rows]}