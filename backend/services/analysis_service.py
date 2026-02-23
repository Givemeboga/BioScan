from sqlalchemy.orm import Session
from models import BilanBiologique, RapportAnomalie
from medical_engine.analyzer import analyze_bilan
from datetime import datetime

def process_bilan(db: Session, bilan_id: int, extracted_data: dict):

    # 1️⃣ Vérifier bilan
    bilan = db.query(BilanBiologique).filter_by(bilan_id=bilan_id).first()
    if not bilan:
        raise Exception("Bilan introuvable")

    # 2️⃣ Analyse IA
    anomalies = analyze_bilan(extracted_data)

    # 3️⃣ Si anomalies → créer rapport_anomalie
    if anomalies:

        rapport = RapportAnomalie(
            version="1.0",
            statut="EN_COURS",
            type_anomalie=", ".join(anomalies),
            date_generation=datetime.now(),
            patient_id=bilan.patient_id,
            medecin_id=None,
            bilan_id=bilan_id
        )

        db.add(rapport)

        # changer statut bilan
        bilan.statut = "EN_COURS"

        db.commit()

        return {
            "status": "ANOMALIES_DETECTED",
            "anomalies": anomalies
        }

    else:
        # Pas d'anomalies
        bilan.statut = "VALIDE"
        db.commit()

        return {
            "status": "NO_ANOMALY",
            "message": "Bilan normal"
        }
