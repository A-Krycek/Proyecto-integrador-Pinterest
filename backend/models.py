from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str
    image: str
    creationAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    pins: List["Pin"] = Relationship(back_populates="category")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    password: str
    avatar_url: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    
    pins: List["Pin"] = Relationship(back_populates="user")

class Follow(SQLModel, table=True):
    follower_id: int = Field(foreign_key="user.id", primary_key=True)
    followed_id: int = Field(foreign_key="user.id", primary_key=True)
    creationAt: datetime = Field(default_factory=datetime.utcnow)

class Pin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    slug: str
    description: str
    image_url: str  
    tags: str       
    status: str = Field(default="pending")  
    moderation_reason: Optional[str] = Field(default=None)
    creationAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    category_id: int = Field(foreign_key="category.id")
    category: Optional[Category] = Relationship(back_populates="pins")
    
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="pins")