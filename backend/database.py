from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

# 🔑 Modifie ici ton mot de passe si nécessaire
DATABASE_URL = "postgresql://postgres:MotDePasse123@localhost:5432/bioscan_db"

# Création de l'engine SQLAlchemy
engine = create_engine(DATABASE_URL)

# Création de la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base déclarative
Base = declarative_base()

# --- Test de connexion ---
try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("Connexion réussie ! Version PostgreSQL :", result.fetchone()[0])
except Exception as e:
    print("Erreur de connexion :", e)
    exit()

# --- Lister les tables ---
inspector = inspect(engine)
tables = inspector.get_table_names()
print("\nTables dans la base :")
for table in tables:
    print(" -", table)

# --- Afficher les données de chaque table ---
if tables:
    print("\nContenu des tables :")
    with engine.connect() as connection:
        for table in tables:
            print(f"\nTable: {table}")
            result = connection.execute(text(f"SELECT * FROM {table};"))
            rows = result.fetchall()
            if rows:
                for row in rows:
                    print(row)
            else:
                print("(vide)")
