import base64
import logging
import os
import re
from io import BytesIO
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Document Security"])

BASE_DIR = Path(__file__).resolve().parents[2]
SECURE_DIR = BASE_DIR / "media" / "secure"
ENCRYPTED_DIR = SECURE_DIR / "encrypted"
DECRYPTED_DIR = SECURE_DIR / "decrypted"


def _ensure_secure_dirs() -> None:
    ENCRYPTED_DIR.mkdir(parents=True, exist_ok=True)
    DECRYPTED_DIR.mkdir(parents=True, exist_ok=True)


def _get_fernet():
    try:
        from cryptography.fernet import Fernet
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Dépendance cryptography indisponible") from exc

    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Clé de chiffrement manquante")
    return Fernet(key.encode() if isinstance(key, str) else key)


def _is_authorized_for_decrypt(current_user: dict) -> bool:
    return current_user["role"] in {"Admin", "Medecin"}


@router.post("/scan")
def scan_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide")

    try:
        import pyclamd
    except Exception as exc:
        logger.warning("ClamAV library unavailable: %s", exc)
        return {"scan_available": False, "infected": False, "message": "ClamAV indisponible"}

    clam_host = os.getenv("CLAMAV_HOST", "localhost")
    clam_port = int(os.getenv("CLAMAV_PORT", "3310"))

    try:
        clam = pyclamd.ClamdNetworkSocket(host=clam_host, port=clam_port)
        if not clam.ping():
            logger.warning("ClamAV daemon not responding on %s:%s", clam_host, clam_port)
            return {"scan_available": False, "infected": False, "message": "ClamAV indisponible"}

        result = clam.scan_stream(content)
        if result:
            logger.warning("Malware detected in uploaded document for user %s", current_user["user_id"])
            raise HTTPException(status_code=400, detail="Fichier infecté détecté par ClamAV")

        return {"scan_available": True, "infected": False, "message": "Fichier sain"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("ClamAV scan failed: %s", exc)
        return {"scan_available": False, "infected": False, "message": "ClamAV indisponible"}


@router.post("/anonymize")
def anonymize_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide")

    extracted_text = ""
    lower_name = (file.filename or "").lower()

    if lower_name.endswith(".pdf"):
        try:
            from PyPDF2 import PdfReader

            reader = PdfReader(BytesIO(content))
            extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            logger.warning("PDF text extraction failed, falling back to OCR: %s", exc)

    if not extracted_text:
        try:
            from PIL import Image
            import pytesseract

            image = Image.open(BytesIO(content))
            extracted_text = pytesseract.image_to_string(image)
        except Exception as exc:
            logger.error("OCR failed: %s", exc)
            raise HTTPException(status_code=500, detail="Impossible d'effectuer l'OCR") from exc

    detections = []
    anonymized_text = extracted_text

    patterns = [
        ("CIN", r"\b\d{8}\b"),
        ("PHONE", r"\b\d{8}\b"),
        ("EMAIL", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
        ("NAME", r"\b([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'-]+(?:\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'-]+){1,3})\b"),
    ]

    for label, pattern in patterns:
        matches = re.findall(pattern, anonymized_text)
        if matches:
            detections.extend({"type": label, "value": match if isinstance(match, str) else " ".join(match)} for match in matches)
            anonymized_text = re.sub(pattern, "[REDACTED]", anonymized_text)

    return {
        "file_name": file.filename,
        "detections": detections,
        "anonymized_text": anonymized_text,
    }


@router.post("/encrypt")
def encrypt_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_secure_dirs()
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide")

    fernet = _get_fernet()
    encrypted_content = fernet.encrypt(content)
    safe_name = f"{Path(file.filename or 'document').stem}.enc"
    output_path = ENCRYPTED_DIR / safe_name
    output_path.write_bytes(encrypted_content)

    logger.info("Encrypted document for user %s", current_user["user_id"])
    return {"encrypted_file": str(output_path), "message": "Document chiffré"}


@router.post("/decrypt")
def decrypt_document(
    file: UploadFile = File(...),
    original_filename: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _is_authorized_for_decrypt(current_user):
        raise HTTPException(status_code=403, detail="Accès refusé")

    _ensure_secure_dirs()
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide")

    fernet = _get_fernet()
    try:
        decrypted = fernet.decrypt(content)
    except Exception as exc:
        logger.error("Decrypt failed: %s", exc)
        raise HTTPException(status_code=400, detail="Impossible de déchiffrer le document") from exc

    output_name = original_filename or Path(file.filename or "document").stem
    output_path = DECRYPTED_DIR / output_name
    output_path.write_bytes(decrypted)

    logger.info("Decrypted document for user %s", current_user["user_id"])
    return FileResponse(str(output_path), filename=output_path.name)
