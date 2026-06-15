from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from config.db import get_db
from services.authService import AuthService
from middleware.authMiddleware import get_current_user
from models.User import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    company: str
    role: str = "user"

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegisterSchema, db: Session = Depends(get_db)):
    result = AuthService.register_user(
        db=db, full_name=user_data.full_name, email=user_data.email,
        password=user_data.password, company=user_data.company, role=user_data.role
    )
    # result already contains user object from AuthService
    return result


@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    access_token = AuthService.create_access_token(data={"sub": user.email, "user_id": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "company": user.company,
            "role": user.role.value  # This is crucial for role checking
        }
    }


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id, "full_name": current_user.full_name,
        "email": current_user.email, "company": current_user.company,
        "role": current_user.role.value
    }