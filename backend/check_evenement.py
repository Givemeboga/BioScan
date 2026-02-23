from database import engine
from sqlalchemy import inspect, text

inspector = inspect(engine)
tables = inspector.get_table_names()
print("All tables:", tables)
print()

# Check evenement_securite
if 'evenement_securite' in tables:
    cols = inspector.get_columns('evenement_securite')
    print("evenement_securite columns:")
    for col in cols:
        print(f"  - {col['name']}: {col['type']}")
else:
    print("Table 'evenement_securite' not found")
    # Try with schema
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='bioscan'"))
        tables = [row[0] for row in result]
        print(f"Tables in bioscan schema: {tables}")
