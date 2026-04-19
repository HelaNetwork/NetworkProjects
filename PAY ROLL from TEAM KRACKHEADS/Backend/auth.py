from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from models import User
from schemas import UserCreate, Token
from database import db
from security import SecurityService


router = APIRouter()


# =========================
# REGISTER (JSON)
# =========================
@router.post("/register")
def register(user: UserCreate, session: Session = Depends(db.get_db)):

    existing = session.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user.email,
        hashed_password=SecurityService.hash_password(user.password),
        role=user.role
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "User registered successfully"}


# =========================
# LOGIN (OAuth2 Form Data)
# =========================
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(db.get_db)
):

    db_user = session.query(User).filter(User.email == form_data.username).first()

    if not db_user or not SecurityService.verify_password(
        form_data.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = SecurityService.create_access_token(
        data={"sub": db_user.email, "role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

