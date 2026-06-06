from typing import Optional
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    username: str
    email: str
    password: str

class UserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class UserLogin(SQLModel):
    email: str
    password: str

class UserResponse(SQLModel):
    id: int
    username: str
    email: str
