import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.User import User, RoleType, StatusType
from repositories.userRepository import UserRepository
from jose import jwt
from datetime import datetime, timedelta
from config.env import settings

class AuthService:
    # --- Password Hashing using bcrypt directly (No passlib needed) ---
    @staticmethod
    def get_password_hash(password: str) -> str:
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)

    # --- JWT Token Generation ---
    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=60)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    # --- Registration Logic ---
    @staticmethod
    def register_user(db: Session, full_name: str, email: str, password: str, 
                     company: str, role: str = "user") -> dict:
        existing_user = UserRepository.get_by_email(db, email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password using the new bcrypt method
        hashed_password = AuthService.get_password_hash(password)
        user_role = RoleType.ADMIN if role.lower() == "admin" else RoleType.USER
        
        new_user = User(
            full_name=full_name, email=email, hashed_password=hashed_password,
            company=company, role=user_role, status=StatusType.ACTIVE
        )
        
        user = UserRepository.create(db, new_user)
        
        # Generate token immediately so user can access the app
        access_token = AuthService.create_access_token(data={"sub": user.email, "user_id": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id, "full_name": user.full_name, "email": user.email,
                "company": user.company, "role": user.role.value
            }
        }
    
    

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = UserRepository.get_by_email(db, email)
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user