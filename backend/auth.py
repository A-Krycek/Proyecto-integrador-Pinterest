from fastapi import HTTPException
from sqlmodel import Session, select
from models import User

def login(email: str, password: str, session: Session):
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return user
