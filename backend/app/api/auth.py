import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from app.schemas import UserSchema, UserCreate, UserRegisterSchema, UserLoginSchema, AuthResponseSchema
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/users", response_model=List[UserSchema])
def list_demo_users(db: Session = Depends(get_db)):
    """List available demo users for fast UI switching."""
    users = db.query(User).order_by(User.id.asc()).all()
    return users

@router.post("/register", response_model=AuthResponseSchema, status_code=status.HTTP_201_CREATED)
def register_user(data: UserRegisterSchema, db: Session = Depends(get_db)):
    """Register a new user account with login ID & password in database."""
    username_clean = data.username.strip()
    email_clean = data.email.strip().lower()

    existing_user = db.query(User).filter((User.username == username_clean) | (User.email == email_clean)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email already registered. Please login instead."
        )

    hashed_pw = hash_password(data.password)
    new_user = User(
        username=username_clean,
        email=email_clean,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = f"cinesense_token_{new_user.id}_{secrets.token_hex(8)}"
    return AuthResponseSchema(
        user=new_user,
        token=token,
        message="User account registered successfully!"
    )

@router.post("/login", response_model=AuthResponseSchema)
def login_user(data: UserLoginSchema, db: Session = Depends(get_db)):
    """Authenticate user with login ID (email or username) and password."""
    identifier = data.email_or_username.strip().lower()

    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.username.ilike(identifier))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login ID or Password"
        )

    # If seeded user without explicit password, update with hashed password on first login
    if not user.hashed_password:
        user.hashed_password = hash_password(data.password)
        db.commit()
        db.refresh(user)
    elif not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login ID or Password"
        )

    token = f"cinesense_token_{user.id}_{secrets.token_hex(8)}"
    return AuthResponseSchema(
        user=user,
        token=token,
        message="Login successful!"
    )

@router.post("/users", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_new_user(data: UserCreate, db: Session = Depends(get_db)):
    """Create a new custom user profile."""
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        return existing

    hashed_pw = hash_password(data.password or "cinesense123")
    new_user = User(username=data.username, email=data.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/{user_id}", response_model=UserSchema)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
