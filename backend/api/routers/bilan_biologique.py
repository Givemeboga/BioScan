from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.bilan import BilanBiologiqueList


router = APIRouter(
    prefix="/bilans-biologiques",
    tags=["bilans-biologiques"]
)


@router.get("/", response_model=List[BilanBiologiqueList])
def get_bilans(
        db: Session = Depends(get_db),
        search: str = Query(None, description="Recherche dans le nom du patient ou le type de bilan"),
        statut: str = Query(None, description="Filtre par statut (ex: BROUILLON, EN_COURS, TERMINE, VALIDE)"),
    patient_id: Optional[int] = Query(None, description="Filtre par patient_id"),
        limit: int = Query(50, ge=1, le=500, description="Nombre max de résultats"),
        offset: int = Query(0, ge=0, description="Décalage pour la pagination")
):
    """
    Récupère la liste des bilans biologiques avec nom du patient et âge.
    Fonctionne même si patient_id ou utilisateur_id est absent.
    """
    sql_str = """
        SELECT 
            bb.bilan_id,
            bb.type,
            bb.statut,
            bb.date_generation,
            bb.nom_fichier,
            bb.patient_id,
            bb.technicien_id,
            COALESCE(u.nom_utilisateur, 'Aucun patient associé') AS patient_nom_complet,
            CASE 
                WHEN u.date_naissance IS NOT NULL 
                THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_naissance))::integer 
                ELSE NULL 
            END AS age
        FROM bilan_biologique bb
        LEFT JOIN patient p          ON bb.patient_id = p.patient_id
        LEFT JOIN utilisateur u      ON p.utilisateur_id = u.utilisateur_id
        WHERE 1 = 1
    """

    params = {}

    # Filtre recherche (sur nom utilisateur ou type de bilan)
    if search and search.strip():
        pattern = f"%{search.strip()}%"
        sql_str += """
            AND (
                u.nom_utilisateur ILIKE :search 
                OR bb.type ILIKE :search
            )
        """
        params["search"] = pattern

    # Filtre statut
    if statut and statut.strip():
        sql_str += " AND bb.statut = :statut "
        params["statut"] = statut.strip().upper()

    # Filtre patient
    if patient_id is not None:
        sql_str += " AND bb.patient_id = :patient_id "
        params["patient_id"] = patient_id

    # Tri + pagination
    sql_str += """
        ORDER BY bb.date_generation DESC NULLS LAST
        LIMIT :limit 
        OFFSET :offset
    """
    params["limit"] = limit
    params["offset"] = offset

    try:
        sql = text(sql_str)
        result = db.execute(sql, params)
        rows = result.mappings().all()

        # Debug dans le terminal
        print(f"[DEBUG] Nombre de bilans trouvés : {len(rows)}")
        if rows:
            print("[DEBUG] Premier bilan :", dict(rows[0]))

        bilans = []
        for row in rows:
            row_dict = dict(row)

            # Valeurs par défaut propres
            row_dict["patient_nom_complet"] = row_dict.get("patient_nom_complet", "—")
            row_dict["type"] = row_dict.get("type", "—")
            row_dict["statut"] = row_dict.get("statut", "BROUILLON")
            row_dict["age"] = int(row_dict["age"]) if row_dict.get("age") is not None else None

            bilans.append(BilanBiologiqueList(**row_dict))

        return bilans

    except Exception as e:
        print("=== ERREUR SQL DANS GET BILANS ===")
        print("Message :", str(e))
        print("Requête SQL finale :")
        print(sql_str)
        print("Paramètres :", params)
        # On renvoie une liste vide pour éviter crash de validation FastAPI
        return []


@router.get("/patient/", response_model=List[BilanBiologiqueList])
def get_bilans_patient(
        db: Session = Depends(get_db),
        patient_id: int = Query(..., description="ID du patient"),
        limit: int = Query(50, ge=1, le=500, description="Nombre max de résultats"),
        offset: int = Query(0, ge=0, description="Décalage pour la pagination")
):
    """
    Récupère les bilans biologiques pour un patient spécifique.
    """
    return get_bilans(
        db=db,
        search=None,
        statut=None,
        patient_id=patient_id,
        limit=limit,
        offset=offset,
    )


@router.get("/patient/dashboard-stats")
def get_patient_dashboard_stats(
        db: Session = Depends(get_db),
        patient_id: int = Query(..., description="ID du patient")
):
    """
    Statistiques du tableau de bord patient.
    """
    sql_str = """
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE bb.statut = 'VALIDE') AS valides,
            COUNT(*) FILTER (WHERE bb.statut IN ('BROUILLON', 'EN_COURS')) AS en_attente,
            COUNT(*) FILTER (WHERE DATE_PART('year', bb.date_generation) = DATE_PART('year', CURRENT_DATE)) AS cette_annee,
            COUNT(*) FILTER (WHERE DATE_PART('month', bb.date_generation) = DATE_PART('month', CURRENT_DATE)
                              AND DATE_PART('year', bb.date_generation) = DATE_PART('year', CURRENT_DATE)) AS ce_mois
        FROM bilan_biologique bb
        WHERE bb.patient_id = :patient_id
    """

    try:
        result = db.execute(text(sql_str), {"patient_id": patient_id}).mappings().first()
        if not result:
            return {
                "total": 0,
                "valides": 0,
                "enAttente": 0,
                "cetteAnnee": 0,
                "ceMois": 0,
            }

        return {
            "total": int(result.get("total") or 0),
            "valides": int(result.get("valides") or 0),
            "enAttente": int(result.get("en_attente") or 0),
            "cetteAnnee": int(result.get("cette_annee") or 0),
            "ceMois": int(result.get("ce_mois") or 0),
        }
    except Exception as e:
        print("=== ERREUR SQL DANS DASHBOARD STATS ===")
        print("Message :", str(e))
        return {
            "total": 0,
            "valides": 0,
            "enAttente": 0,
            "cetteAnnee": 0,
            "ceMois": 0,
        }