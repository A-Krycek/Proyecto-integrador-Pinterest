from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db import get_session
from models import Category
from schemas.category import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[Category])
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.get("/{category_id}", response_model=Category)
def get_category(category_id: int, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, session: Session = Depends(get_session)):
    # Validar si el slug o nombre ya existe
    existing = session.exec(select(Category).where(Category.slug == category.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="El slug de la categoría ya existe")
    
    new_category = Category(**category.model_dump())
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category

@router.patch("/{category_id}", response_model=Category)
def update_category(category_id: int, data: CategoryUpdate, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    category.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(category)
    session.commit()
