# backend/api/routers/profil_patient.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
import logging

from database import get_db
from schemas.profil_patient import ProfilPatientOut
from utils.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/patient/profil",
    tags=["profil-patient"]
)

# ── Répertoire de stockage des photos ────────────────────────
# Chemin absolu basé sur la position de ce fichier
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "media", "photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

logger.info("[profil_patient] UPLOAD_DIR = %s", UPLOAD_DIR)


def build_photo_url(filename: Optional[str]) -> Optional[str]:
    """Transforme le nom de fichier en URL publique accessible via /media/photos/"""
    if not filename:
        return None
    if filename.startswith(("http://", "https://")):
        return filename
    # Retire tout préfixe de chemin éventuel, garde juste le nom du fichier
    basename = os.path.basename(filename)
    return f"/media/photos/{basename}"


def extract_user_id(current_user: dict) -> int:
    """Extrait l'ID utilisateur depuis différentes clés possibles du JWT"""
    for key in ("utilisateur_id", "user_id", "sub", "id"):
        val = current_user.get(key)
        if val is not None:
            try:
                return int(val)
            except (ValueError, TypeError):
                continue
    logger.warning("Token JWT sans ID valide → payload reçu : %s", current_user)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de lire l'identifiant utilisateur dans le token"
    )


def fetch_profil_by_user_id(db: Session, user_id: int) -> Optional[dict]:
    """Récupère les infos utilisateur + patient"""
    sql = """
        SELECT
            u.utilisateur_id,
            p.patient_id,
            u.nom_utilisateur,
            u.email,
            u.telephone,
            u.adresse,
            TO_CHAR(u.date_naissance, 'YYYY-MM-DD') AS date_naissance,
            u.photo_url
        FROM bioscan.utilisateur u
        LEFT JOIN bioscan.patient p ON p.utilisateur_id = u.utilisateur_id
        WHERE u.utilisateur_id = :user_id
    """
    row = db.execute(text(sql), {"user_id": user_id}).mappings().first()
    if not row:
        return None

    data = dict(row)
    data["photo_url"] = build_photo_url(data.get("photo_url"))
    return data


# ─────────────────────────────────────────────────────────────
# GET /api/patient/profil/me
# ─────────────────────────────────────────────────────────────
@router.get("/me", response_model=ProfilPatientOut)
def get_mon_profil(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = extract_user_id(current_user)
    logger.debug("[GET /patient/profil/me] user_id=%d", user_id)

    profil = fetch_profil_by_user_id(db, user_id)
    if not profil:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    if profil["patient_id"] is None:
        raise HTTPException(
            status_code=404,
            detail="Profil patient non trouvé. Veuillez compléter votre inscription."
        )

    return ProfilPatientOut(**profil)


# ─────────────────────────────────────────────────────────────
# GET /api/patient/profil/{patient_id}
# ─────────────────────────────────────────────────────────────
@router.get("/{patient_id}", response_model=ProfilPatientOut)
def get_profil(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caller_id = extract_user_id(current_user)
    role = (current_user.get("role") or "").strip().lower()

    sql = """
        SELECT
            u.utilisateur_id,
            p.patient_id,
            u.nom_utilisateur,
            u.email,
            u.telephone,
            u.adresse,
            TO_CHAR(u.date_naissance, 'YYYY-MM-DD') AS date_naissance,
            u.photo_url
        FROM bioscan.patient p
        JOIN bioscan.utilisateur u ON u.utilisateur_id = p.utilisateur_id
        WHERE p.patient_id = :patient_id
    """
    row = db.execute(text(sql), {"patient_id": patient_id}).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    if role == "patient" and row["utilisateur_id"] != caller_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé à ce profil")

    data = dict(row)
    data["photo_url"] = build_photo_url(data.get("photo_url"))
    return ProfilPatientOut(**data)


# ─────────────────────────────────────────────────────────────
# PUT /api/patient/profil/{patient_id}
# ─────────────────────────────────────────────────────────────
@router.put("/{patient_id}", response_model=ProfilPatientOut)
async def update_profil(
    patient_id: int,
    nom_utilisateur: Optional[str] = Form(None),
    email:           Optional[str] = Form(None),
    telephone:       Optional[str] = Form(None),
    adresse:         Optional[str] = Form(None),
    date_naissance:  Optional[str] = Form(None),
    photo: Optional[UploadFile]    = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caller_id = extract_user_id(current_user)
    role = (current_user.get("role") or "").strip().lower()

    logger.debug("[PUT /patient/profil/%d] demandé par user %d", patient_id, caller_id)

    # ── Vérification existence + droits ──────────────────────
    check = db.execute(
        text("""
            SELECT u.utilisateur_id, u.photo_url
            FROM bioscan.patient p
            JOIN bioscan.utilisateur u ON u.utilisateur_id = p.utilisateur_id
            WHERE p.patient_id = :pid
        """),
        {"pid": patient_id}
    ).mappings().first()

    if not check:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    if role == "patient" and check["utilisateur_id"] != caller_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que votre propre profil")

    utilisateur_id     = check["utilisateur_id"]
    old_photo_filename = check.get("photo_url")  # peut être "nom.jpg" ou "/media/photos/nom.jpg"
    new_photo_filename = old_photo_filename       # par défaut : inchangé

    # ── Gestion de la photo ───────────────────────────────────
    if photo and photo.filename:
        content_type = photo.content_type or ""
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Le fichier doit être une image (jpeg, png…)")

        contents = await photo.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Le fichier image est vide.")
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="La photo ne doit pas dépasser 5 Mo.")

        # Génère un nom unique
        ext = os.path.splitext(photo.filename)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            ext = ".jpg"
        new_photo_filename = f"{uuid.uuid4().hex}{ext}"

        # Sauvegarde dans UPLOAD_DIR (chemin absolu)
        photo_path = os.path.join(UPLOAD_DIR, new_photo_filename)
        try:
            with open(photo_path, "wb") as f:
                f.write(contents)
            logger.info("[PUT profil] Photo sauvegardée → %s", photo_path)
        except OSError as e:
            logger.error("Échec écriture photo %s : %s", photo_path, e)
            raise HTTPException(status_code=500, detail="Impossible d'enregistrer la photo.")

        # Supprime l'ancienne photo si elle existe et est différente
        if old_photo_filename:
            old_basename = os.path.basename(old_photo_filename)
            if old_basename and old_basename != new_photo_filename:
                old_path = os.path.join(UPLOAD_DIR, old_basename)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                        logger.info("[PUT profil] Ancienne photo supprimée → %s", old_path)
                    except OSError as e:
                        logger.warning("Impossible de supprimer l'ancienne photo : %s", e)

    # ── Construction de la requête UPDATE ────────────────────
    fields: list = []
    params: dict = {"utilisateur_id": utilisateur_id}

    if nom_utilisateur is not None:
        fields.append("nom_utilisateur = :nom_utilisateur")
        params["nom_utilisateur"] = nom_utilisateur.strip()

    if email is not None:
        fields.append("email = :email")
        params["email"] = email.strip()

    if telephone is not None:
        fields.append("telephone = :telephone")
        params["telephone"] = telephone.strip()

    if adresse is not None:
        fields.append("adresse = :adresse")
        params["adresse"] = adresse.strip()

    if date_naissance and date_naissance.strip():
        fields.append("date_naissance = :date_naissance")
        params["date_naissance"] = date_naissance.strip()

    # Met à jour photo_url uniquement si une nouvelle a été uploadée
    if photo and photo.filename and new_photo_filename != old_photo_filename:
        fields.append("photo_url = :photo_url")
        params["photo_url"] = new_photo_filename   # stocke juste le nom du fichier en DB

    if not fields:
        # Rien à modifier → retour de l'état actuel
        current = fetch_profil_by_user_id(db, utilisateur_id)
        if current:
            return ProfilPatientOut(**current)
        raise HTTPException(status_code=404, detail="Profil introuvable")

    # ── Exécution UPDATE ─────────────────────────────────────
    try:
        updated_row = db.execute(
            text(f"""
                UPDATE bioscan.utilisateur
                SET {', '.join(fields)}
                WHERE utilisateur_id = :utilisateur_id
                RETURNING
                    utilisateur_id,
                    nom_utilisateur,
                    email,
                    telephone,
                    adresse,
                    TO_CHAR(date_naissance, 'YYYY-MM-DD') AS date_naissance,
                    photo_url
            """),
            params
        ).mappings().first()

        db.commit()

        if not updated_row:
            raise HTTPException(status_code=500, detail="Échec de la mise à jour.")

        result = dict(updated_row)
        result["patient_id"] = patient_id
        result["photo_url"]  = build_photo_url(result.get("photo_url"))

        logger.info("[PUT profil] Succès → patient_id=%d user_id=%d photo=%s",
                    patient_id, utilisateur_id, result["photo_url"])

        return ProfilPatientOut(**result)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Erreur lors de la mise à jour du profil patient %d", patient_id)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")