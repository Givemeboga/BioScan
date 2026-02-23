from database import SessionLocal
from models.utilisateur import Utilisateur
from models.role import Role
from models.technicien import TechnicienBiologiste

db = SessionLocal()

try:
    # Get all users with "Technicien biologiste" role
    technicien_users = db.query(Utilisateur).join(Role).filter(Role.nom == 'Technicien biologiste').all()
    
    print(f"Found {len(technicien_users)} users with 'Technicien biologiste' role")
    
    added_count = 0
    for user in technicien_users:
        # Check if already in technicien_biologiste table
        existing = db.query(TechnicienBiologiste).filter(
            TechnicienBiologiste.utilisateur_id == user.utilisateur_id
        ).first()
        
        if not existing:
            # Add to technicien_biologiste table
            technicien = TechnicienBiologiste(utilisateur_id=user.utilisateur_id)
            db.add(technicien)
            added_count += 1
            print(f"  Added: {user.nom_utilisateur} ({user.utilisateur_id})")
        else:
            print(f"  Already exists: {user.nom_utilisateur} ({user.utilisateur_id})")
    
    db.commit()
    print(f"\nSuccessfully added {added_count} techniciens")
    
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
