from typing import Optional
from sqlmodel import SQLModel

class CategoryCreate(SQLModel):
    name: str
    slug: str
    image: str

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image: Optional[str] = None
