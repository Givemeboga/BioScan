from database import SessionLocal
from models.medecin import MedecinBiologiste
from models.utilisateur import Utilisateur

db = SessionLocal()
medecins = db.query(MedecinBiologiste).all()
print(f"Total medecins in database: {len(medecins)}")

if medecins:
    for m in medecins:
        user = m.utilisateur if hasattr(m, 'utilisateur') and m.utilisateur else None
        print(f"  - ID: {m.medecin_id}, User: {user.nom_utilisateur if user else 'None'}")
else:
    print("No medecins found in database")

db.close()
