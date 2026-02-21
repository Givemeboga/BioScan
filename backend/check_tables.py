from database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print('Tables:', tables)

if 'evenement_securite' in tables:
    columns = inspector.get_columns('evenement_securite')
    print('\nColumns in evenement_securite:')
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
else:
    print('\nevenement_securite NOT found')
