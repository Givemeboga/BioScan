#!/usr/bin/env python3
"""
Migration script to add role column to utilisateur table
Run this script to migrate the database schema
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "youssef")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "bioscan_db")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

def migrate():
    """Add role column to utilisateur table"""
    with engine.connect() as connection:
        try:
            # Add role column if it doesn't exist
            connection.execute(text("""
                ALTER TABLE bioscan.utilisateur
                ADD COLUMN IF NOT EXISTS role VARCHAR(50)
            """))
            connection.commit()
            print("✓ Successfully added 'role' column to utilisateur table")
        except Exception as e:
            print(f"✗ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("Running migration: Add role column to utilisateur table...")
    migrate()
    print("Migration complete!")
