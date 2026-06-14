from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import func
from db import get_session
from models import User, Follow
from auth import login
from schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    response_users = []
    for user in users:
        followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == user.id)).one()
        following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == user.id)).one()
        response_users.append(UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            avatar_url=user.avatar_url,
            bio=user.bio,
            followers_count=followers_count,
            following_count=following_count
        ))
    return response_users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)).one()
    following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)).one()
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        bio=user.bio,
        followers_count=followers_count,
        following_count=following_count
    )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado")
    
    new_user = User(**user.model_dump())
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        avatar_url=new_user.avatar_url,
        bio=new_user.bio,
        followers_count=0,
        following_count=0
    )

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(user)
    session.commit()
    session.refresh(user)
    
    followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)).one()
    following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)).one()
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        bio=user.bio,
        followers_count=followers_count,
        following_count=following_count
    )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    session.delete(user)
    session.commit()

@router.post("/login", response_model=UserResponse)
def user_login(data: UserLogin, session: Session = Depends(get_session)):
    user = login(data.email, data.password, session)
    followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == user.id)).one()
    following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == user.id)).one()
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        bio=user.bio,
        followers_count=followers_count,
        following_count=following_count
    )

@router.post("/{followed_id}/follow", response_model=dict)
def toggle_follow(followed_id: int, follower_id: int, session: Session = Depends(get_session)):
    if followed_id == follower_id:
        raise HTTPException(status_code=400, detail="No puedes seguirte a ti mismo")
    
    follower = session.get(User, follower_id)
    followed = session.get(User, followed_id)
    if not follower or not followed:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    follow = session.exec(
        select(Follow).where(Follow.follower_id == follower_id, Follow.followed_id == followed_id)
    ).first()
    
    if follow:
        session.delete(follow)
        status_following = False
        detail = "Dejaste de seguir a este usuario"
    else:
        new_follow = Follow(follower_id=follower_id, followed_id=followed_id)
        session.add(new_follow)
        status_following = True
        detail = "Ahora sigues a este usuario"
        
    session.commit()
    
    followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == followed_id)).one()
    return {
        "following": status_following,
        "detail": detail,
        "followers_count": followers_count
    }

@router.get("/{followed_id}/is-following", response_model=dict)
def check_is_following(followed_id: int, follower_id: int, session: Session = Depends(get_session)):
    follow = session.exec(
        select(Follow).where(Follow.follower_id == follower_id, Follow.followed_id == followed_id)
    ).first()
    return {"following": follow is not None}

@router.get("/{user_id}/followers", response_model=list[UserResponse])
def get_followers(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    statement = select(User).join(Follow, Follow.follower_id == User.id).where(Follow.followed_id == user_id)
    followers = session.exec(statement).all()
    
    response_users = []
    for u in followers:
        followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == u.id)).one()
        following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == u.id)).one()
        response_users.append(UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            avatar_url=u.avatar_url,
            bio=u.bio,
            followers_count=followers_count,
            following_count=following_count
        ))
    return response_users

@router.get("/{user_id}/following", response_model=list[UserResponse])
def get_following(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    statement = select(User).join(Follow, Follow.followed_id == User.id).where(Follow.follower_id == user_id)
    following = session.exec(statement).all()
    
    response_users = []
    for u in following:
        followers_count = session.exec(select(func.count()).select_from(Follow).where(Follow.followed_id == u.id)).one()
        following_count = session.exec(select(func.count()).select_from(Follow).where(Follow.follower_id == u.id)).one()
        response_users.append(UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            avatar_url=u.avatar_url,
            bio=u.bio,
            followers_count=followers_count,
            following_count=following_count
        ))
    return response_users