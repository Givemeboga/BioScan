from fastapi import APIRouter, Depends, Query ,HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime
from database import get_db
from schemas.bilan import BilanBiologiqueList
from parsers.parser_factory import ParserFactory
from medical_engine.analyzer import analyze_bilan

router = APIRouter(
    prefix="/bilans-biologiques",
    tags=["bilans-biologiques"]
)

@router.get("/", response_model=List[BilanBiologiqueList])
def get_bilans(
        db: Session = Depends(get_db),
        search: str = Query(None, description="Recherche dans le nom du patient ou le type de bilan"),
        statut: str = Query(None, description="Filtre par statut (ex: BROUILLON, EN_COURS, TERMINE, VALIDE)"),
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

@router.post("/analyse/{bilan_id}")
def analyse_bilan_route(bilan_id: int, db: Session = Depends(get_db)):

    # 1️⃣ Récupérer le bilan
    bilan = db.execute(
        text("SELECT * FROM bilan_biologique WHERE bilan_id = :id"),
        {"id": bilan_id}
    ).mappings().first()

    if not bilan:
        raise HTTPException(status_code=404, detail="Bilan introuvable")

    file_path = bilan["nom_fichier"]
    print(f"[DEBUG] Path du fichier : {file_path}")
    print(f"[DEBUG] Existe ? {os.path.exists(file_path)}")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")

    # 2️⃣ Parser automatiquement selon extension
    parser = ParserFactory.get_parser(file_path)
    extracted_data = parser.parse(file_path)

    all_anomalies = []

    # 🔥 Gère cas liste (multi patients)
    if isinstance(extracted_data, list):
        for patient in extracted_data:
            anomalies = analyze_bilan(patient)
            all_anomalies.extend(anomalies)
    else:
        all_anomalies = analyze_bilan(extracted_data)

    return {
        "bilan_id": bilan_id,
        "anomalies_detectees": all_anomalies
    }

    # 3️⃣ Analyse IA
    anomalies = analyze_bilan(extracted_data)

    # 4️⃣ Retour simple (sans notification comme demandé)
    return {
        "bilan_id": bilan_id,
        "anomalies_detectees": anomalies
    }
from fastapi import UploadFile, File
import shutil

@router.post("/upload")
async def upload_bilan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # 1️⃣ Sauvegarde fichier
        upload_folder = "uploads"
        os.makedirs(upload_folder, exist_ok=True)

        file_path = os.path.join(upload_folder, file.filename)
        file_path = os.path.normpath(file_path)  # ✅ mieux que replace

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2️⃣ Insertion bilan
        result = db.execute(
            text("""
                INSERT INTO bilan_biologique
                (statut, type, nom_fichier, date_generation)
                VALUES ('EN_COURS', 'IMPORT_AUTO', :file_path, :date)
                RETURNING bilan_id
            """),
            {
                "file_path": file_path,
                "date": datetime.now()
            }
        )

        bilan_id = result.scalar()

        # 3️⃣ Parser
        parser = ParserFactory.get_parser(file_path)
        extracted_data = parser.parse(file_path)

        # 4️⃣ Analyse
        all_anomalies = []

        if isinstance(extracted_data, list):
            for patient in extracted_data:
                anomalies = analyze_bilan(patient)
                all_anomalies.extend(anomalies)
        else:
            all_anomalies = analyze_bilan(extracted_data)

        # 5️⃣ Sauvegarde anomalies
        for anomaly in all_anomalies:
            db.execute(
                text("""
                    INSERT INTO rapport_anomalie
                    (version, statut, type_anomalie, date_generation, bilan_id)
                    VALUES ('1.0', 'EN_COURS', :type_anomalie, :date, :bilan_id)
                """),
                {
                    "type_anomalie": anomaly,
                    "date": datetime.now(),
                    "bilan_id": bilan_id
                }
            )

        # 6️⃣ Mise à jour statut
        db.execute(
            text("""
                UPDATE bilan_biologique
                SET statut = 'VALIDE'
                WHERE bilan_id = :id
            """),
            {"id": bilan_id}
        )

        db.commit()

        return {
            "message": "Bilan analysé avec succès",
            "bilan_id": bilan_id,
            "anomalies_detectees": all_anomalies
        }

    except Exception as e:
        db.rollback()  # 🔥 très important
        print("❌ ERREUR UPLOAD:", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du bilan")