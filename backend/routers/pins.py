from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.sql.expression import func
from db import get_session, engine
from models import Pin, Category, User
from schemas.pin import PinCreate, PinUpdate
from utils.moderation import auto_generate_tags, analyze_content_heuristics
import boto3


import os
from dotenv import load_dotenv
load_dotenv()

ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "YOUR_ACCESS_KEY")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "YOUR_SECRET_KEY")
BUCKET_NAME = "lookbook-data-storage-dfpaz"

s3_client = boto3.client(
    's3',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY
)

def sign_pin_url(pin: Pin) -> Pin:
    if pin and pin.image_url and pin.image_url.startswith(f"https://{BUCKET_NAME}.s3.amazonaws.com/"):
        key = pin.image_url.replace(f"https://{BUCKET_NAME}.s3.amazonaws.com/", "")
        try:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': key},
                ExpiresIn=604800 
            )
            pin.image_url = presigned_url
        except Exception as e:
            pass
    return pin

router = APIRouter(prefix="/pins", tags=["pins"])

@router.get("/", response_model=list[Pin])
def get_pins(
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    user_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    statement = select(Pin)
    
    if user_id:
        statement = statement.where(Pin.user_id == user_id).order_by(Pin.creationAt.desc())
        pins = session.exec(statement).all()
        return [sign_pin_url(p) for p in pins]
        
    statement = statement.where(Pin.status == "approved")
    
    if q:
        search_filter = f"%{q}%"
        statement = statement.join(Category).where(
            (Pin.title.like(search_filter)) | 
            (Pin.description.like(search_filter)) | 
            (Pin.tags.like(search_filter)) |
            (Category.name.like(search_filter))
        ).order_by(Pin.creationAt.desc())
        pins = session.exec(statement).all()
        return [sign_pin_url(p) for p in pins]
        
    if category_id:
        statement = statement.where(Pin.category_id == category_id).order_by(Pin.creationAt.desc())
        pins = session.exec(statement).all()
        return [sign_pin_url(p) for p in pins]
        
    statement = statement.order_by(func.random())
    pins = session.exec(statement).all()
    return [sign_pin_url(p) for p in pins]

@router.get("/{pin_id}", response_model=Pin)
def get_pin(pin_id: int, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return sign_pin_url(pin)

@router.post("/", response_model=Pin, status_code=status.HTTP_201_CREATED)
def create_pin(pin: PinCreate, session: Session = Depends(get_session)):
    if not session.get(User, pin.user_id):
        raise HTTPException(status_code=404, detail="El usuario creador especificado no existe")
    
    category = session.get(Category, pin.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="La categoría especificada no existe")
        
    ai_tags = auto_generate_tags(pin.title, pin.description, category.name)
    user_tags_list = [t.strip().lower() for t in pin.tags.split(",") if t.strip()]
    merged_tags = list(set(user_tags_list + ai_tags))
    tags_str = ", ".join(merged_tags)
    
    new_pin = Pin(**pin.model_dump())
    new_pin.tags = tags_str
    
    is_approved, reason = analyze_content_heuristics(
        title=new_pin.title,
        description=new_pin.description,
        tags=new_pin.tags,
        image_url=new_pin.image_url
    )
    
    if is_approved:
        new_pin.status = "approved"
        new_pin.moderation_reason = None
    else:
        new_pin.status = "rejected"
        new_pin.moderation_reason = reason
        
    session.add(new_pin)
    session.commit()
    session.refresh(new_pin)
    return sign_pin_url(new_pin)

@router.patch("/{pin_id}", response_model=Pin)
def update_pin(pin_id: int, data: PinUpdate, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
        
    pin.sqlmodel_update(data.model_dump(exclude_unset=True))
    
    category = session.get(Category, pin.category_id)
    category_name = category.name if category else ""
    
    ai_tags = auto_generate_tags(pin.title, pin.description, category_name)
    user_tags_list = [t.strip().lower() for t in pin.tags.split(",") if t.strip()]
    merged_tags = list(set(user_tags_list + ai_tags))
    pin.tags = ", ".join(merged_tags)
    
    is_approved, reason = analyze_content_heuristics(
        title=pin.title,
        description=pin.description,
        tags=pin.tags,
        image_url=pin.image_url
    )
    
    if is_approved:
        pin.status = "approved"
        pin.moderation_reason = None
    else:
        pin.status = "rejected"
        pin.moderation_reason = reason
        
    session.add(pin)
    session.commit()
    session.refresh(pin)
    return sign_pin_url(pin)

@router.delete("/{pin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pin(pin_id: int, user_id: int, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    if pin.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta publicación")
    session.delete(pin)
    session.commit()