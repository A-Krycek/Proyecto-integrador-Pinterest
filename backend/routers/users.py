from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db import get_session
from models import User, Pin, SavedPin, Follow
from auth import login
from schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse
from sqlalchemy import func

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
def get_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    # Validar si el email ya existe
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado")
    
    new_user = User(**user.model_dump())
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    session.delete(user)
    session.commit()

@router.post("/login", response_model=UserResponse)
def user_login(data: UserLogin, session: Session = Depends(get_session)):
    return login(data.email, data.password, session)

# --- Endpoints de Seguidores y Pines del Usuario ---

@router.get("/{user_id}/pins", response_model=list[Pin])
def get_user_created_pins(user_id: int, session: Session = Depends(get_session)):
    statement = select(Pin).where(Pin.user_id == user_id)
    return session.exec(statement).all()

@router.get("/{user_id}/saved", response_model=list[Pin])
def get_user_saved_pins(user_id: int, session: Session = Depends(get_session)):
    statement = select(Pin).join(SavedPin, SavedPin.pin_id == Pin.id).where(SavedPin.user_id == user_id)
    return session.exec(statement).all()

@router.post("/{user_id}/follow/{target_id}")
def follow_user(user_id: int, target_id: int, session: Session = Depends(get_session)):
    if user_id == target_id:
        raise HTTPException(status_code=400, detail="No puedes seguirte a ti mismo")
    existing = session.exec(select(Follow).where(Follow.follower_id == user_id, Follow.followed_id == target_id)).first()
    if existing:
        return {"status": "already_following"}
    new_follow = Follow(follower_id=user_id, followed_id=target_id)
    session.add(new_follow)
    session.commit()
    return {"status": "following"}

@router.delete("/{user_id}/unfollow/{target_id}")
def unfollow_user(user_id: int, target_id: int, session: Session = Depends(get_session)):
    existing = session.exec(select(Follow).where(Follow.follower_id == user_id, Follow.followed_id == target_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="No sigues a este usuario")
    session.delete(existing)
    session.commit()
    return {"status": "unfollowed"}

@router.get("/{user_id}/follow-status/{target_id}")
def follow_status(user_id: int, target_id: int, session: Session = Depends(get_session)):
    existing = session.exec(select(Follow).where(Follow.follower_id == user_id, Follow.followed_id == target_id)).first()
    return {"is_following": existing is not None}

@router.get("/{user_id}/follow-stats")
def get_follow_stats(user_id: int, session: Session = Depends(get_session)):
    followers = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)).one()
    following = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)).one()
    return {"followers_count": followers, "following_count": following}

