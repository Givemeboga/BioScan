# api/routers/profil.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from schemas.profil import ProfilMedecinOut, ProfilMedecinUpdate

router = APIRouter(prefix="/profil", tags=["profil"])


# ==================== GET /api/profil/{user_id} ====================
@router.get("/{user_id}", response_model=ProfilMedecinOut)
def get_profil_par_id(user_id: int, db: Session = Depends(get_db)):

    sql_str = """
        SELECT 
            utilisateur_id,
            nom_utilisateur,
            mot_de_passe,
            email,
            telephone,
            adresse,
            date_naissance,
            statut,
            date_generation,
            date_mise_a_jour
        FROM utilisateur
        WHERE utilisateur_id = :user_id
        LIMIT 1
    """

    try:
        result = db.execute(text(sql_str), {"user_id": user_id})
        row = result.mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Profil non trouvé")

        row_dict = dict(row)

        # valeurs par défaut si champs vides
        row_dict["nom_utilisateur"] = row_dict.get("nom_utilisateur") or "—"
        row_dict["telephone"] = row_dict.get("telephone") or "—"
        row_dict["email"] = row_dict.get("email") or "—"
        row_dict["adresse"] = row_dict.get("adresse") or "—"
        row_dict["mot_de_passe"] = row_dict.get("mot_de_passe") or "—"
        row_dict["statut"] = row_dict.get("statut") or "actif"  # valeur par défaut simple
        row_dict["date_generation"] = row_dict.get("date_generation") or datetime.utcnow()
        row_dict["date_mise_a_jour"] = row_dict.get("date_mise_a_jour") or datetime.utcnow()
        row_dict["date_naissance"] = row_dict.get("date_naissance")  # peut rester None

        return ProfilMedecinOut(**row_dict)

    except Exception as e:
        print("ERREUR :", e)
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du profil")


# ==================== PUT /api/profil/{user_id} ====================
@router.put("/{user_id}", response_model=ProfilMedecinOut)
def modifier_profil(user_id: int, profil: ProfilMedecinUpdate, db: Session = Depends(get_db)):

    # Vérifier si le profil existe
    existing = db.execute(
        text("SELECT * FROM utilisateur WHERE utilisateur_id = :id"),
        {"id": user_id}
    ).mappings().first()

    if not existing:
        raise HTTPException(status_code=404, detail="Profil non trouvé")

    # Construire la requête UPDATE dynamiquement
    update_fields = {k: v for k, v in profil.dict(exclude_unset=True).items() if v is not None}

    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")

    update_fields["date_mise_a_jour"] = datetime.utcnow()  # mise à jour automatique

    set_clause = ", ".join(f"{key} = :{key}" for key in update_fields.keys())
    sql_str = f"UPDATE utilisateur SET {set_clause} WHERE utilisateur_id = :user_id"

    update_fields["user_id"] = user_id

    try:
        db.execute(text(sql_str), update_fields)
        db.commit()

        # Retourner le profil mis à jour
        row = db.execute(
            text("SELECT * FROM utilisateur WHERE utilisateur_id = :id"),
            {"id": user_id}
        ).mappings().first()

        row_dict = dict(row)
        row_dict["nom_utilisateur"] = row_dict.get("nom_utilisateur") or "—"
        row_dict["telephone"] = row_dict.get("telephone") or "—"
        row_dict["email"] = row_dict.get("email") or "—"
        row_dict["adresse"] = row_dict.get("adresse") or "—"
        row_dict["mot_de_passe"] = row_dict.get("mot_de_passe") or "—"
        row_dict["statut"] = row_dict.get("statut") or "actif"
        row_dict["date_generation"] = row_dict.get("date_generation") or datetime.utcnow()
        row_dict["date_mise_a_jour"] = row_dict.get("date_mise_a_jour") or datetime.utcnow()
        row_dict["date_naissance"] = row_dict.get("date_naissance")

        return ProfilMedecinOut(**row_dict)

    except Exception as e:
        print("ERREUR :", e)
        raise HTTPException(status_code=500, detail="Erreur lors de la modification du profil")
