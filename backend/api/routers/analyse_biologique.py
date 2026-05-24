import logging
import re
from io import BytesIO
from typing import Any, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analyse", tags=["Analyse Biologique"])

NORMAL_RANGES = {
    "hemoglobine": {"label": "Hemoglobine", "min": 12.0, "max": 17.0, "unit": "g/dL"},
    "globules blancs": {"label": "Globules blancs", "min": 4000.0, "max": 11000.0, "unit": "/mm3"},
    "plaquettes": {"label": "Plaquettes", "min": 150000.0, "max": 400000.0, "unit": "/mm3"},
    "glycemie": {"label": "Glycemie", "min": 0.7, "max": 1.1, "unit": "g/L"},
    "creatinine": {"label": "Creatinine", "min": 6.0, "max": 12.0, "unit": "mg/L"},
    "cholesterol": {"label": "Cholesterol", "min": None, "max": 2.0, "unit": "g/L"},
}

COLUMN_ALIASES = {
    "hemoglobine": ["hemoglobine", "hb", "hémoglobine"],
    "globules blancs": ["globules blancs", "wbc", "leucocytes"],
    "plaquettes": ["plaquettes", "platelets"],
    "glycemie": ["glycemie", "glycémie", "glucose"],
    "creatinine": ["creatinine", "créatinine"],
    "cholesterol": ["cholesterol", "cholestérol", "cholesterol total"],
}


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _coerce_number(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text_value = str(value).replace(",", ".")
    match = re.search(r"-?\d+(?:\.\d+)?", text_value)
    return float(match.group(0)) if match else None


def _severity_from_percent(percent_outside: float) -> str:
    if percent_outside > 50:
        return "CRITICAL"
    if percent_outside > 25:
        return "HIGH"
    if percent_outside > 10:
        return "MEDIUM"
    return "LOW"


def _find_column(columns, aliases):
    normalized_columns = { _normalize(column): column for column in columns }
    for alias in aliases:
        for normalized, original in normalized_columns.items():
            if alias in normalized:
                return original
    return None


def _get_current_technicien_id(db: Session, user_id: int) -> Optional[int]:
    row = db.execute(
        text("SELECT technicien_id FROM bioscan.technicien_biologiste WHERE utilisateur_id = :user_id"),
        {"user_id": user_id},
    ).mappings().first()
    return int(row["technicien_id"]) if row else None


def _get_current_medecin_id(db: Session, user_id: int) -> Optional[int]:
    row = db.execute(
        text("SELECT medecin_id FROM bioscan.medecin_biologiste WHERE utilisateur_id = :user_id"),
        {"user_id": user_id},
    ).mappings().first()
    return int(row["medecin_id"]) if row else None


@router.post("/upload")
def upload_biological_analysis(
    file: UploadFile = File(...),
    bilan_id: Optional[int] = Form(None),
    patient_id: Optional[int] = Form(None),
    technicien_id: Optional[int] = Form(None),
    medecin_id: Optional[int] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] not in {"Admin", "Technicien", "Medecin"}:
        raise HTTPException(status_code=403, detail="Accès refusé")

    try:
        import pandas as pd
    except Exception as exc:
        logger.error("Pandas unavailable: %s", exc)
        raise HTTPException(status_code=500, detail="Dépendance pandas indisponible") from exc

    filename = file.filename or "analyse"
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide")

    lower_name = filename.lower()
    try:
        if lower_name.endswith(".csv"):
            dataframe = pd.read_csv(BytesIO(content))
        elif lower_name.endswith((".xls", ".xlsx")):
            dataframe = pd.read_excel(BytesIO(content), engine="openpyxl")
        else:
            raise HTTPException(status_code=400, detail="Format de fichier non supporté")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Unable to parse analysis file: %s", exc)
        raise HTTPException(status_code=400, detail="Impossible de lire le fichier") from exc

    if dataframe.empty:
        raise HTTPException(status_code=400, detail="Aucune donnée trouvée dans le fichier")

    source_columns = list(dataframe.columns)
    detected_anomalies = []

    if not bilan_id:
        if current_user["role"] == "Technicien":
            technicien_id = technicien_id or _get_current_technicien_id(db, current_user["user_id"])
        if current_user["role"] == "Medecin":
            medecin_id = medecin_id or _get_current_medecin_id(db, current_user["user_id"])

        result = db.execute(
            text(
                """
                INSERT INTO bioscan.bilan_biologique
                    (type, statut, nom_fichier, date_generation, patient_id, technicien_id, medecin_id)
                VALUES
                    (:type, :statut, :nom_fichier, NOW(), :patient_id, :technicien_id, :medecin_id)
                RETURNING bilan_id
                """
            ),
            {
                "type": "ANALYSE_BIOLOGIQUE",
                "statut": "TERMINE",
                "nom_fichier": filename,
                "patient_id": patient_id,
                "technicien_id": technicien_id,
                "medecin_id": medecin_id,
            },
        ).mappings().first()
        db.commit()
        bilan_id = int(result["bilan_id"])

    for marker_key, bounds in NORMAL_RANGES.items():
        column_name = _find_column(source_columns, COLUMN_ALIASES[marker_key])
        if not column_name:
            continue

        for row_index, row in dataframe.iterrows():
            measured = _coerce_number(row[column_name])
            if measured is None:
                continue

            normal_min = bounds["min"]
            normal_max = bounds["max"]
            outside = False
            reference_text = ""
            percent_outside = 0.0

            if normal_min is not None and measured < normal_min:
                outside = True
                reference_text = f"{normal_min} - {normal_max} {bounds['unit']}"
                percent_outside = ((normal_min - measured) / normal_min) * 100 if normal_min else 0
            elif normal_max is not None and measured > normal_max:
                outside = True
                reference_text = (
                    f"< {normal_max} {bounds['unit']}" if normal_min is None else f"{normal_min} - {normal_max} {bounds['unit']}"
                )
                percent_outside = ((measured - normal_max) / normal_max) * 100 if normal_max else 0

            if not outside:
                continue

            severity = _severity_from_percent(percent_outside)
            anomaly = {
                "marqueur": bounds["label"],
                "valeur_mesuree": measured,
                "valeur_normale": reference_text,
                "severite": severity,
                "description": f"{bounds['label']} hors plage de référence",
            }
            detected_anomalies.append(anomaly)

            db.execute(
                text(
                    """
                    INSERT INTO bioscan.rapport_anomalie
                        (bilan_id, description, severite, valeur_mesuree, valeur_normale, marqueur, date_generation)
                    VALUES
                        (:bilan_id, :description, :severite, :valeur_mesuree, :valeur_normale, :marqueur, NOW())
                    """
                ),
                {
                    "bilan_id": bilan_id,
                    "description": anomaly["description"],
                    "severite": anomaly["severite"],
                    "valeur_mesuree": str(anomaly["valeur_mesuree"]),
                    "valeur_normale": anomaly["valeur_normale"],
                    "marqueur": anomaly["marqueur"],
                },
            )

    db.commit()
    logger.info("Biological analysis processed for bilan %s with %s anomalies", bilan_id, len(detected_anomalies))
    return {"bilan_id": bilan_id, "anomalies": detected_anomalies}
