from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config.db import get_db
from middleware.authMiddleware import get_current_user
from models.User import User, StatusType

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[dict])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id, 
            "full_name": u.full_name, 
            "email": u.email,
            "company": u.company, 
            "role": u.role.value, 
            "status": u.status.value
        } for u in users
    ]

@router.put("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot deactivate yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = StatusType.INACTIVE
    db.commit()
    return {"message": "User deactivated successfully"}