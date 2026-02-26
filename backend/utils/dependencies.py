from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from security import SECRET_KEY, ALGORITHM
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

    user = db.query(Utilisateur).filter(Utilisateur.utilisateur_id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user
