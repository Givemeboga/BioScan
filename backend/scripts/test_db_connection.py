"""Quick script to test DB connection.
Run: python scripts/test_db_connection.py
"""
import os
import sys
from sqlalchemy import text
# Ensure project root (parent of scripts/) is on sys.path so imports work when running this file directly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from database import engine

def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            val = result.scalar()
            print("DB connection successful, SELECT 1 returned:", val)
    except Exception as e:
        print("DB connection failed:", e)

if __name__ == "__main__":
    test_connection()
