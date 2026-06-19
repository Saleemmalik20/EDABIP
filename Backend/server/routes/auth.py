from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from config.db import get_db
from services.authService import AuthService
from services.securityService import SecurityService
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
    return result

@router.post("/login")
def login_user(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Find the user first
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Attempt authentication
    authenticated_user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not authenticated_user:
        # Record failed login ONLY if user exists (to avoid FK constraint violation)
        if user:
            try:
                ip_address = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
                
                print(f"\n🔒 FAILED LOGIN ATTEMPT")
                print(f"   User: {user.email}")
                print(f"   IP: {ip_address}")
                
                SecurityService.record_failed_login(db, user, ip_address, user_agent)
                
            except Exception as e:
                print(f"⚠️  Security logging failed: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"\n⚠️  LOGIN ATTEMPT FOR NON-EXISTENT USER: {form_data.username}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is active
    if authenticated_user.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    # Create access token
    access_token = AuthService.create_access_token(data={"sub": authenticated_user.email, "user_id": authenticated_user.id})
    
    print(f"\n✅ SUCCESSFUL LOGIN: {authenticated_user.email}\n")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": authenticated_user.id,
            "full_name": authenticated_user.full_name,
            "email": authenticated_user.email,
            "company": authenticated_user.company,
            "role": authenticated_user.role.value
        }
    }

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id, "full_name": current_user.full_name,
        "email": current_user.email, "company": current_user.company,
        "role": current_user.role.value
    }