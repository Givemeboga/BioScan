# backend/api/routers/profil_medecin.py

import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from schemas.profil_medecin import ProfilMedecinOut, ProfilMedecinUpdate
from utils.security import get_current_user          # ✅ chemin corrigé

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/profil",
    tags=["profil"]
)

# ── Répertoire absolu de stockage ────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "media", "avatars")
os.makedirs(UPLOAD_DIR, exist_ok=True)

logger.info("[profil_medecin] UPLOAD_DIR = %s", UPLOAD_DIR)


def build_photo_url(photo_url: str | None) -> str | None:
    """Normalise l'URL de la photo → toujours /media/avatars/<fichier>"""
    if not photo_url:
        return None
    if photo_url.startswith(("http://", "https://")):
        return photo_url
    basename = os.path.basename(photo_url)
    return f"/media/avatars/{basename}"


def _fetch_profil(user_id: int, db: Session) -> dict:
    row = db.execute(
        text("""
            SELECT
                u.utilisateur_id,
                u.nom_utilisateur,
                u.email,
                u.telephone,
                u.statut,
                u.date_naissance,
                u.date_generation,
                u.photo_url,
                u.role_id
            FROM bioscan.utilisateur u
            WHERE u.utilisateur_id = :uid
        """),
        {"uid": user_id}
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    data = dict(row)
    data["photo_url"] = build_photo_url(data.get("photo_url"))
    return data


# ─────────────────────────────────────────────────────────────────
# GET /api/profil/me
# ─────────────────────────────────────────────────────────────────
@router.get("/me", response_model=ProfilMedecinOut)
def get_mon_profil(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    logger.debug("[GET /profil/me] user_id=%s", user_id)

    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non identifié.")

    return _fetch_profil(user_id, db)


# ─────────────────────────────────────────────────────────────────
# GET /api/profil/{user_id}
# ─────────────────────────────────────────────────────────────────
@router.get("/{user_id}", response_model=ProfilMedecinOut)
def get_profil_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    caller_id = current_user.get("user_id")
    if caller_id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")

    return _fetch_profil(user_id, db)


# ─────────────────────────────────────────────────────────────────
# PUT /api/profil/me
# ─────────────────────────────────────────────────────────────────
@router.put("/me", response_model=ProfilMedecinOut)
def update_mon_profil(
    payload: ProfilMedecinUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non identifié.")

    return _do_update(user_id, payload, db)


# ─────────────────────────────────────────────────────────────────
# PUT /api/profil/{user_id}
# ─────────────────────────────────────────────────────────────────
@router.put("/{user_id}", response_model=ProfilMedecinOut)
def update_profil_by_id(
    user_id: int,
    payload: ProfilMedecinUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    caller_id = current_user.get("user_id")
    if caller_id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")

    return _do_update(user_id, payload, db)


# ─────────────────────────────────────────────────────────────────
# POST /api/profil/me/photo
# ─────────────────────────────────────────────────────────────────
@router.post("/me/photo", response_model=ProfilMedecinOut)
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non identifié.")

    # ── Validation type ──────────────────────────────────────────
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Fichier invalide. Utilisez une image (JPG, PNG, WEBP…)."
        )

    # ── Lecture + taille max 5 Mo ────────────────────────────────
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Le fichier image est vide.")
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La photo ne doit pas dépasser 5 Mo.")

    # ── Nom de fichier unique ────────────────────────────────────
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        ext = ".jpg"
    filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}{ext}"

    # ── Sauvegarde sur disque (chemin absolu) ────────────────────
    filepath = os.path.join(UPLOAD_DIR, filename)
    try:
        with open(filepath, "wb") as f:
            f.write(contents)
        logger.info("[POST /profil/me/photo] Photo sauvegardée → %s", filepath)
    except OSError as e:
        logger.error("Échec écriture photo : %s", e)
        raise HTTPException(status_code=500, detail="Impossible d'enregistrer la photo.")

    # ── Suppression ancienne photo ───────────────────────────────
    row = db.execute(
        text("SELECT photo_url FROM utilisateur WHERE utilisateur_id = :uid"),
        {"uid": user_id}
    ).mappings().first()

    if row and row["photo_url"]:
        old_basename = os.path.basename(row["photo_url"])
        if old_basename and old_basename != filename:
            old_path = os.path.join(UPLOAD_DIR, old_basename)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                    logger.info("[POST /profil/me/photo] Ancienne photo supprimée → %s", old_path)
                except OSError as e:
                    logger.warning("Impossible de supprimer l'ancienne photo : %s", e)

    # ── Mise à jour DB — stocke seulement le nom du fichier ──────
    db.execute(
        text("UPDATE utilisateur SET photo_url = :url WHERE utilisateur_id = :uid"),
        {"url": filename, "uid": user_id}
    )
    db.commit()

    return _fetch_profil(user_id, db)


# ─────────────────────────────────────────────────────────────────
# Helpers internes
# ─────────────────────────────────────────────────────────────────
def _do_update(user_id: int, payload: ProfilMedecinUpdate, db: Session) -> dict:
    fields: dict = {}

    if payload.nom_utilisateur is not None:
        fields["nom_utilisateur"] = payload.nom_utilisateur.strip()
    if payload.email is not None:
        fields["email"] = str(payload.email).strip()
    if payload.telephone is not None:
        fields["telephone"] = payload.telephone.strip()
    if payload.statut is not None:
        fields["statut"] = payload.statut.strip()
    if payload.photo_url is not None:
        fields["photo_url"] = os.path.basename(payload.photo_url)

    # Hash du mot de passe si fourni
    if payload.mot_de_passe is not None and payload.mot_de_passe.strip():
        from passlib.context import CryptContext
        pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        fields["mot_de_passe"] = pwd_ctx.hash(payload.mot_de_passe[:72])

    if not fields:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour.")

    set_clause = ", ".join(f"{k} = :{k}" for k in fields)
    fields["uid"] = user_id

    try:
        db.execute(
            text(f"UPDATE utilisateur SET {set_clause} WHERE utilisateur_id = :uid"),
            fields
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception("Erreur UPDATE profil médecin user_id=%d", user_id)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

    return _fetch_profil(user_id, db)