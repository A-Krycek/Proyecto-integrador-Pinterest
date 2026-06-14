from typing import Optional
from sqlmodel import SQLModel

class PinCreate(SQLModel):
    title: str
    slug: str
    description: str
    image_url: str
    tags: str
    category_id: int
    user_id: int