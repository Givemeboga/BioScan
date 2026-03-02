from parsers.parser_factory import ParserFactory
from services.analysis_service import process_bilan
from sqlalchemy.orm import Session
from datetime import datetime
from models.bilan_biologique import BilanBiologique
import os
def upload_bilan(db: Session, file, patient_id: int):

    file_path = save_file(file)

    # Création Bilan
    bilan = BilanBiologique(
        statut="BROUILLON",
        type="BIOLOGIQUE",
        nom_fichier=file.filename,
        date_generation=datetime.now(),
        patient_id=patient_id
    )

    db.add(bilan)
    db.commit()
    db.refresh(bilan)

    # 🔥 Parser dynamique
    parser = ParserFactory.get_parser(file_path)
    extracted_data = parser.parse(file_path)

    # 🔥 Analyse IA
    result = process_bilan(db, bilan.bilan_id, extracted_data)

    return result

UPLOAD_DIR = "uploads"

def save_file(file):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path