# backend/api/routers/parametres.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
from schemas.parametres import ParametresOut, ParametresUpdate, PasswordChange
from utils.security import get_current_user   # ✅ chemin corrigé : utils.security

router = APIRouter(
    prefix="/patient/parametres",
    tags=["parametres-patient"]
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


# ─────────────────────────────────────────────────────────────
# GET /api/patient/parametres/me
# ─────────────────────────────────────────────────────────────
@router.get("/me", response_model=ParametresOut)
def get_parametres(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caller_id = current_user.get("user_id")
    print(f"[DEBUG parametres] GET /me | caller_id={caller_id}")

    sql = """
        SELECT
            u.utilisateur_id,
            p.patient_id,
            u.nom_utilisateur,
            u.email,
            u.telephone,
            u.adresse,
            COALESCE(pp.notifications, true)  AS notifications,
            COALESCE(pp.newsletter,    false) AS newsletter
        FROM bioscan.utilisateur u
        JOIN bioscan.patient p ON p.utilisateur_id = u.utilisateur_id
        LEFT JOIN bioscan.patient_preferences pp ON pp.patient_id = p.patient_id
        WHERE u.utilisateur_id = :user_id
    """

    try:
        result = db.execute(text(sql), {"user_id": caller_id})
        row = result.mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Patient introuvable")

        print(f"[DEBUG parametres] Trouvé : {row['nom_utilisateur']}")
        return ParametresOut(**dict(row))

    except HTTPException:
        raise
    except Exception as e:
        print("=== ERREUR GET parametres ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors du chargement des paramètres")


# ─────────────────────────────────────────────────────────────
# PUT /api/patient/parametres/me
# ─────────────────────────────────────────────────────────────
@router.put("/me", response_model=ParametresOut)
def update_parametres(
    payload: ParametresUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caller_id = current_user.get("user_id")
    print(f"[DEBUG parametres] PUT /me | caller_id={caller_id} | payload={payload}")

    check = db.execute(
        text("""
            SELECT u.utilisateur_id, p.patient_id
            FROM bioscan.utilisateur u
            JOIN bioscan.patient p ON p.utilisateur_id = u.utilisateur_id
            WHERE u.utilisateur_id = :user_id
        """),
        {"user_id": caller_id}
    ).mappings().first()

    if not check:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    utilisateur_id = check["utilisateur_id"]
    patient_id     = check["patient_id"]

    # ── Mise à jour utilisateur ───────────────────────────────
    u_fields = []
    u_params: dict = {"utilisateur_id": utilisateur_id}

    if payload.nom_utilisateur is not None:
        u_fields.append("nom_utilisateur = :nom_utilisateur")
        u_params["nom_utilisateur"] = payload.nom_utilisateur

    if payload.email is not None:
        u_fields.append("email = :email")
        u_params["email"] = payload.email

    if payload.telephone is not None:
        u_fields.append("telephone = :telephone")
        u_params["telephone"] = payload.telephone

    if payload.adresse is not None:
        u_fields.append("adresse = :adresse")
        u_params["adresse"] = payload.adresse

    if u_fields:
        db.execute(
            text(f"""
                UPDATE bioscan.utilisateur
                SET {', '.join(u_fields)}
                WHERE utilisateur_id = :utilisateur_id
            """),
            u_params
        )

    # ── Mise à jour préférences (upsert) ──────────────────────
    if payload.notifications is not None or payload.newsletter is not None:
        notif  = payload.notifications if payload.notifications is not None else True
        newslt = payload.newsletter    if payload.newsletter    is not None else False

        db.execute(
            text("""
                INSERT INTO bioscan.patient_preferences (patient_id, notifications, newsletter)
                VALUES (:patient_id, :notifications, :newsletter)
                ON CONFLICT (patient_id) DO UPDATE
                SET notifications = EXCLUDED.notifications,
                    newsletter    = EXCLUDED.newsletter
            """),
            {"patient_id": patient_id, "notifications": notif, "newsletter": newslt}
        )

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print("=== ERREUR PUT parametres ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

    return get_parametres(db=db, current_user=current_user)


# ─────────────────────────────────────────────────────────────
# PUT /api/patient/parametres/password
# ─────────────────────────────────────────────────────────────
@router.put("/password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caller_id = current_user.get("user_id")
    print(f"[DEBUG parametres] PUT /password | caller_id={caller_id}")

    row = db.execute(
        text("SELECT mot_de_passe FROM bioscan.utilisateur WHERE utilisateur_id = :uid"),
        {"uid": caller_id}
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Tronquer à 72 caractères (cohérent avec auth.py)
    ancien_tronque = payload.ancien_mot_de_passe[:72]
    if not pwd_context.verify(ancien_tronque, row["mot_de_passe"]):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")

    if len(payload.nouveau_mot_de_passe) < 6:
        raise HTTPException(
            status_code=400,
            detail="Le mot de passe doit contenir au moins 6 caractères"
        )

    new_hash = pwd_context.hash(payload.nouveau_mot_de_passe[:72])

    try:
        db.execute(
            text("UPDATE bioscan.utilisateur SET mot_de_passe = :hash WHERE utilisateur_id = :uid"),
            {"hash": new_hash, "uid": caller_id}
        )
        db.commit()
        return {"message": "Mot de passe mis à jour avec succès"}
    except Exception as e:
        db.rollback()
        print("=== ERREUR PUT password ===", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors du changement de mot de passe")