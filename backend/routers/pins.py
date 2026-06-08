from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, SQLModel
from sqlalchemy.sql.expression import func
from db import get_session
from models import Pin, Category, User, Comment, SavedPin
from schemas.pin import PinCreate, PinUpdate
import boto3

class CommentCreate(SQLModel):
    content: str
    user_id: int


import os
# Cargar variables de entorno desde .env si existe
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "YOUR_ACCESS_KEY")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "YOUR_SECRET_KEY")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "lookbook-data-storage-dfpaz")

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
                ExpiresIn=604800 # 7 días (máximo permitido)
            )
            pin.image_url = presigned_url
        except Exception as e:
            print(f"Error al firmar URL S3: {e}")
    return pin

router = APIRouter(prefix="/pins", tags=["pins"])

# Lista de palabras prohibidas para la verificación ética de moderación de contenido
PROHIBITED_WORDS = [
    "violencia", "odio", "armas", "ilegal", "droga", "ofensivo", 
    "bullying", "acoso", "insulto", "dañino", "porno", "suicidio"
]

def verify_ethical_content(title: str, description: str, tags: str):
    """
    Mecanismo activo de verificación ética de contenido.
    Analiza el título, descripción y etiquetas buscando términos prohibidos.
    """
    content_to_check = f"{title} {description} {tags}".lower()
    for word in PROHIBITED_WORDS:
        if word in content_to_check:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Contenido rechazado por moderación de políticas éticas. El término '{word}' infringe las normas de privacidad, seguridad y convivencia de Lookbook."
            )

@router.get("/", response_model=list[Pin])
def get_pins(
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """
    Obtiene las publicaciones.
    - Si se provee el parámetro 'q', busca por título, descripción o etiquetas.
    - Si se provee 'category_id', filtra por esa categoría.
    - En ausencia de filtros, devuelve un feed aleatorio (Pinterest style) usando func.random().
    """
    statement = select(Pin)
    
    if q:
        # Búsqueda multi-atributo
        search_filter = f"%{q}%"
        statement = statement.where(
            (Pin.title.like(search_filter)) | 
            (Pin.description.like(search_filter)) | 
            (Pin.tags.like(search_filter))
        )
        pins = session.exec(statement).all()
        return [sign_pin_url(p) for p in pins]
        
    if category_id:
        statement = statement.where(Pin.category_id == category_id)
        pins = session.exec(statement).all()
        return [sign_pin_url(p) for p in pins]
        
    # En ausencia de filtros, feed ordenado por fecha de creación descendente (los más nuevos primero)
    statement = statement.order_by(Pin.creationAt.desc())
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
    # 1. Aplicación del mecanismo de verificación ética de contenido
    verify_ethical_content(pin.title, pin.description, pin.tags)
    
    # 2. Verificar existencia de usuario y categoría
    if not session.get(User, pin.user_id):
        raise HTTPException(status_code=404, detail="El usuario creador especificado no existe")
    if not session.get(Category, pin.category_id):
        raise HTTPException(status_code=404, detail="La categoría especificada no existe")
        
    image_url_str = pin.image_url
    if image_url_str and image_url_str.startswith("data:image/"):
        import base64
        import uuid
        try:
            header, encoded = image_url_str.split(",", 1)
            mime_type = header.split(";")[0].split(":")[1]
            ext = mime_type.split("/")[1]
            if ext == "jpeg":
                ext = "jpg"
            image_data = base64.b64decode(encoded)
            s3_key = f"pins/uploaded-{pin.slug}-{uuid.uuid4().hex[:8]}.{ext}"
            
            try:
                s3_client.put_object(
                    Bucket=BUCKET_NAME,
                    Key=s3_key,
                    Body=image_data,
                    ContentType=mime_type,
                    ACL="public-read"
                )
            except Exception as e:
                s3_client.put_object(
                    Bucket=BUCKET_NAME,
                    Key=s3_key,
                    Body=image_data,
                    ContentType=mime_type
                )
            image_url_str = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        except Exception as e:
            print(f"Error al subir imagen a S3: {e}")
            raise HTTPException(status_code=400, detail=f"Error al procesar y subir la imagen a AWS S3: {str(e)}")

    new_pin = Pin(**pin.model_dump())
    new_pin.image_url = image_url_str
    session.add(new_pin)
    session.commit()
    session.refresh(new_pin)
    return sign_pin_url(new_pin)

@router.patch("/{pin_id}", response_model=Pin)
def update_pin(pin_id: int, data: PinUpdate, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
        
    # Validar éticamente si se actualizan campos clave
    new_title = data.title if data.title is not None else pin.title
    new_desc = data.description if data.description is not None else pin.description
    new_tags = data.tags if data.tags is not None else pin.tags
    verify_ethical_content(new_title, new_desc, new_tags)
    
    pin.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(pin)
    session.commit()
    session.refresh(pin)
    return sign_pin_url(pin)

@router.delete("/{pin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pin(pin_id: int, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    session.delete(pin)
    session.commit()

# --- Endpoints de Comentarios y Guardado de Pines ---

@router.post("/{pin_id}/comments")
def add_comment(pin_id: int, comment: CommentCreate, session: Session = Depends(get_session)):
    pin = session.get(Pin, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    user = session.get(User, comment.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    new_comment = Comment(content=comment.content, pin_id=pin_id, user_id=comment.user_id)
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    return {"id": new_comment.id, "content": new_comment.content, "username": user.username}

@router.get("/{pin_id}/comments")
def get_comments(pin_id: int, session: Session = Depends(get_session)):
    statement = select(Comment, User.username).join(User, Comment.user_id == User.id).where(Comment.pin_id == pin_id)
    results = session.exec(statement).all()
    comments_list = []
    for comment, username in results:
        comments_list.append({
            "id": comment.id,
            "content": comment.content,
            "creationAt": comment.creationAt,
            "pin_id": comment.pin_id,
            "user_id": comment.user_id,
            "username": username
        })
    return comments_list

@router.post("/{pin_id}/save")
def save_pin(pin_id: int, payload: dict, session: Session = Depends(get_session)):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Falta user_id")
    existing = session.exec(select(SavedPin).where(SavedPin.user_id == user_id, SavedPin.pin_id == pin_id)).first()
    if existing:
        return {"status": "already_saved"}
    new_saved = SavedPin(user_id=user_id, pin_id=pin_id)
    session.add(new_saved)
    session.commit()
    return {"status": "saved"}

@router.delete("/{pin_id}/unsave")
def unsave_pin(pin_id: int, user_id: int, session: Session = Depends(get_session)):
    existing = session.exec(select(SavedPin).where(SavedPin.user_id == user_id, SavedPin.pin_id == pin_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="No guardado")
    session.delete(existing)
    session.commit()
    return {"status": "unsaved"}

@router.get("/{pin_id}/is-saved")
def is_saved(pin_id: int, user_id: int, session: Session = Depends(get_session)):
    existing = session.exec(select(SavedPin).where(SavedPin.user_id == user_id, SavedPin.pin_id == pin_id)).first()
    return {"is_saved": existing is not None}

