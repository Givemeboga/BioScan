from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
import os

from database import get_db
from medical_engine.analyzer import analyze_bilan
from models.bilan_biologique import BilanBiologique
from parsers.parser_factory import ParserFactory
from services.upload_service import upload_bilan as service_upload_bilan
from services.analysis_service import process_bilan

router = APIRouter(
    prefix="/analyse-biologique",
    tags=["analyse-biologique"],
)


@router.post("/upload")
def upload_and_analyze(
    file: UploadFile = File(...),
    patient_id: int = Form(...),
    db: Session = Depends(get_db),
):
    return service_upload_bilan(db, file, patient_id)


@router.post("/analyse/{bilan_id}")
def analyze_existing_bilan(
    bilan_id: int,
    db: Session = Depends(get_db),
):
    bilan = db.query(BilanBiologique).filter(BilanBiologique.bilan_id == bilan_id).first()
    if not bilan:
        raise HTTPException(status_code=404, detail="Bilan introuvable")

    if not bilan.nom_fichier:
        raise HTTPException(status_code=404, detail="Fichier de bilan introuvable")

    file_path = bilan.nom_fichier
    if not os.path.isabs(file_path):
        candidate = os.path.join("uploads", file_path)
        if os.path.exists(candidate):
            file_path = candidate

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")

    parser = ParserFactory.get_parser(file_path)
    extracted_data = parser.parse(file_path)
    result = process_bilan(db, bilan_id, extracted_data)

    return {
        "bilan_id": bilan_id,
        "extracted_data": extracted_data,
        "analysis": result,
        "anomalies": analyze_bilan(extracted_data),
    }