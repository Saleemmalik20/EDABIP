from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from config.db import get_db
from middleware.authMiddleware import get_current_user
from models.User import User
from services.securityService import SecurityService
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/security", tags=["Security"])

class SecurityEventResponse(BaseModel):
    id: int
    user_id: Optional[int]
    event_type: str
    description: str
    ip_address: Optional[str]
    risk_score: int
    risk_level: str
    is_resolved: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SecuritySummaryResponse(BaseModel):
    alerts_today: int
    open_alerts: int
    resolved_alerts: int
    critical_alerts: int

@router.get("/events", response_model=List[SecurityEventResponse])
def get_security_events(
    event_type: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get security events (admin only)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    events = SecurityService.get_security_events(
        db, 
        event_type=event_type,
        is_resolved=is_resolved,
        limit=limit
    )
    
    return events

@router.get("/summary", response_model=SecuritySummaryResponse)
def get_security_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get security summary (admin only)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return SecurityService.get_security_summary(db)

@router.get("/top-risk-users")
def get_top_risk_users(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top risk users (admin only)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    risk_users = SecurityService.get_top_risk_users(db, limit)
    
    result = []
    for risk in risk_users:
        result.append({
            "user_id": risk.user_id,
            "user_name": risk.user.full_name if risk.user else "Unknown",
            "user_email": risk.user.email if risk.user else "Unknown",
            "total_score": risk.total_score,
            "failed_login_count": risk.failed_login_count,
            "unauthorized_access_count": risk.unauthorized_access_count
        })
    
    return result

@router.post("/alerts/{event_id}/resolve")
def resolve_alert(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve a security alert (admin only)"""
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if SecurityService.resolve_alert(db, event_id):
        return {"message": "Alert resolved successfully"}
    raise HTTPException(status_code=404, detail="Alert not found")