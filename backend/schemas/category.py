from typing import Optional
from sqlmodel import SQLModel

class CategoryCreate(SQLModel):
    name: str
    slug: str
    image: str