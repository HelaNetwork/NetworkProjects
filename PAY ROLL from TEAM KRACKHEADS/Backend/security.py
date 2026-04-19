from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import db
from models import User
from config import settings
import os
import secrets


class SecurityService:
    # ---------------------------
    # JWT settings
    # ---------------------------
    SECRET_KEY = settings.SECRET_KEY or os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

    # ---------------------------
    # Password hashing
    # ---------------------------
    pwd_context = CryptContext(
        schemes=["pbkdf2_sha256"],
        deprecated="auto"
    )

    # OAuth2 dependency
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

    # ---------------------------
    # Hash / verify password
    # ---------------------------
    @classmethod
    def hash_password(cls, password: str) -> str:
        return cls.pwd_context.hash(password)

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return cls.pwd_context.verify(plain_password, hashed_password)

    # ---------------------------
    # JWT token creation
    # ---------------------------
    @classmethod
    def create_access_token(cls, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    # ---------------------------
    # Get current user from token
    # ---------------------------
    @classmethod
    def get_current_user(
        cls,
        token: str = Depends(oauth2_scheme),
        session: Session = Depends(db.get_db)
    ) -> User:

        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user = session.query(User).filter(User.email == email).first()
        if user is None:
            raise credentials_exception

        return user
