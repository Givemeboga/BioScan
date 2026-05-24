import os

import pandas as pd
from sqlalchemy import text
from database import get_db
from parsers.parser_factory import ParserFactory
from medical_engine.analyzer import analyze_bilan

def create_dataset(db):
    """
    Crée un dataset consolidé à partir des bilans existants, prêt pour l'IA.
    """
    # 1️⃣ Récupérer tous les bilans
    bilans_query = """
        SELECT bilan_id, patient_id, technicien_id, date_generation, statut, nom_fichier
        FROM bilan_biologique
    """
    bilans = db.execute(text(bilans_query)).mappings().all()

    df_list = []

    for bilan in bilans:
        file_path = bilan['nom_fichier']
        # Vérifier fichier
        if not file_path or not os.path.exists(file_path):
            continue

        # 2️⃣ Parser le fichier
        parser = ParserFactory.get_parser(file_path)
        data = parser.parse(file_path)  # dictionnaire {param: valeur}

        # 3️⃣ Ajouter les métadonnées
        data['bilan_id'] = bilan['bilan_id']
        data['patient_id'] = bilan['patient_id']
        data['technicien_id'] = bilan['technicien_id']
        data['date_bilan'] = bilan['date_generation']
        data['statut'] = bilan['statut']

        # Ajouter au dataset
        df_list.append(pd.DataFrame([data]))

    # 4️⃣ Combiner tous les bilans
    dataset = pd.concat(df_list, ignore_index=True)

    # 5️⃣ Ajouter la colonne 'is_anomaly' si un rapport validé existe
    anomaly_query = """
        SELECT ra.bilan_id
        FROM rapport_anomalie ra
        JOIN validation_anomalie va ON ra.rapport_anomalie_id = va.rapport_anomalie_id
    """
    anomalies = db.execute(text(anomaly_query)).mappings().all()
    anomaly_bilan_ids = set([a['bilan_id'] for a in anomalies if a['bilan_id'] is not None])

    dataset['is_anomaly'] = dataset['bilan_id'].apply(lambda x: 1 if x in anomaly_bilan_ids else 0)

    # 6️⃣ Nettoyage rapide (valeurs manquantes)
    numerical_cols = dataset.select_dtypes(include=['float64','int64']).columns
    for col in numerical_cols:
        dataset[col] = dataset[col].fillna(dataset[col].mean())

    # 7️⃣ Exporter le dataset
    dataset.to_csv('dataset_bilans_ia.csv', index=False)
    print("✅ Dataset créé : dataset_bilans_ia.csv")
    return dataset

# -------------------------
# Exemple d'utilisation
# -------------------------
if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    create_dataset(db)
    db.close()