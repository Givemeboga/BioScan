"""Create admin table (if missing), insert a test admin user, and read it back.
Run: python scripts/test_admin_model.py
"""
import os
import sys
from sqlalchemy import select

# Ensure project root on path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from database import engine, Base
from models.utilisateur import Utilisateur, get_user_by_username, get_password_hash
from models.administrateur import Administrateur
from sqlalchemy.orm import Session


def run_test():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        # Ensure a Utilisateur exists for the admin
        user = get_user_by_username(session, "test_admin_user")
        if not user:
            user = Utilisateur(
                nom_utilisateur="test_admin_user",
                email="test_admin_user@example.com",
                mot_de_passe=get_password_hash("change_me_user"),
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print("Inserted utilisateur for admin test:", user.utilisateur_id)
        else:
            print("Utilisateur already exists:", user.utilisateur_id)

        # Check if administrateur already exists for this utilisateur
        existing_admin = session.query(Administrateur).filter(Administrateur.utilisateur_id == user.utilisateur_id).first()
        if existing_admin:
            print("Administrateur already exists for utilisateur:", user.utilisateur_id)
            return

        # Create administrateur row
        admin_row = Administrateur(
            utilisateur_id=user.utilisateur_id
        )
        session.add(admin_row)
        session.commit()
        session.refresh(admin_row)
        print("Inserted administrateur:", admin_row.administrateur_id, "for utilisateur", admin_row.utilisateur_id)


if __name__ == "__main__":
    run_test()
