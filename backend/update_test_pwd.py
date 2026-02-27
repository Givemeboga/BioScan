from database import engine
from sqlalchemy import text

# Update the test user with a known password
new_pwd = "$pbkdf2-sha256$29000$iLFWyjmnVAoBoHQOYYxRag$gac.D3eGsB/e1VT6qH3o/wMzwAl/rhHiLEDIrfPOaoY"

with engine.connect() as conn:
    result = conn.execute(
        text('UPDATE bioscan.utilisateur SET mot_de_passe = :pwd WHERE email = :email'),
        {'pwd': new_pwd, 'email': 'log@gmail.com'}
    )
    conn.commit()
    print(f"Updated {result.rowcount} user(s)")
    print(f"Test with: log@gmail.com / test123456")
