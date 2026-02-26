"""List all database tables"""
from sqlalchemy import text
from database import engine

with engine.connect() as conn:
    # Get all tables
    result = conn.execute(text("""
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY schemaname, tablename;
    """))
    tables = result.fetchall()
    
    print("\n📊 Database Tables Found:\n")
    if tables:
        for schema, table in tables:
            print(f"   {schema}.{table}")
        print(f"\nTotal: {len(tables)} table(s)")
    else:
        print("   No tables found")
    
    # Check specific important tables
    print("\n🔍 Checking important tables:\n")
    important_tables = ['utilisateur', 'role', 'patient', 'medecin_biologiste', 
                       'technicien_biologiste', 'bilan_biologique', 'rapport_medical']
    
    for table in important_tables:
        try:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table};"))
            count = result.scalar()
            print(f"   ✅ {table:25} - {count} row(s)")
        except Exception as e:
            print(f"   ❌ {table:25} - Not found or error")
