from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Check what columns exist
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'bioscan' AND table_name = 'evenement_securite'
    """))
    print("evenement_securite columns:")
    for row in result:
        print(f"  - {row[0]}: {row[1]}")
    
    print("\n\nData in evenement_securite:")
    result = conn.execute(text("SELECT * FROM bioscan.evenement_securite LIMIT 5"))
    for row in result:
        print(row)
