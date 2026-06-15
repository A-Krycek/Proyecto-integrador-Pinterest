from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db import get_session
from models import Category
from schemas.category import CategoryCreate

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[Category])
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()



@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, session: Session = Depends(get_session)):
    
    existing = session.exec(select(Category).where(Category.slug == category.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="El slug de la categoría ya existe")
    
    new_category = Category(**category.model_dump())
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category