from sqlalchemy.orm import Session
from models.SecurityEvent import SecurityEvent, EventType, RiskLevel
from models.UserRiskScore import UserRiskScore
from models.User import User
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import json

class SecurityService:
    FAILED_LOGIN_SCORE = 5
    FIVE_FAILED_LOGINS_BONUS = 25
    UNAUTHORIZED_ACCESS_SCORE = 15
    
    LOW_RISK_MAX = 29
    MEDIUM_RISK_MAX = 59
    HIGH_RISK_MAX = 99

    @staticmethod
    def calculate_risk_level(score: int) -> RiskLevel:
        if score <= SecurityService.LOW_RISK_MAX:
            return RiskLevel.LOW
        elif score <= SecurityService.MEDIUM_RISK_MAX:
            return RiskLevel.MEDIUM
        elif score <= SecurityService.HIGH_RISK_MAX:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    @staticmethod
    def record_failed_login(db: Session, user, ip_address: str = None, user_agent: str = None):
        """Record a failed login attempt and update risk score"""
        try:
            # Get or create user risk score
            risk_score = db.query(UserRiskScore).filter(
                UserRiskScore.user_id == user.id
            ).first()
            
            if not risk_score:
                risk_score = UserRiskScore(user_id=user.id)
                db.add(risk_score)
                db.flush()  # Get the ID before committing
            
            # Update failed login count
            risk_score.failed_login_count += 1
            risk_score.last_failed_login = datetime.utcnow()
            
            # Calculate score
            base_score = risk_score.failed_login_count * SecurityService.FAILED_LOGIN_SCORE
            if risk_score.failed_login_count >= 5:
                base_score += SecurityService.FIVE_FAILED_LOGINS_BONUS
            
            risk_score.total_score = base_score
            risk_score.updated_at = datetime.utcnow()
            
            # Get company name
            company_name = getattr(user, 'company', None)
            
            # Create security event
            event = SecurityEvent(
                user_id=user.id,
                company_name=company_name,
                event_type=EventType.FAILED_LOGIN,
                description=f"Failed login attempt for {user.email} (attempt {risk_score.failed_login_count})",
                ip_address=ip_address,
                user_agent=user_agent,
                risk_score=SecurityService.FAILED_LOGIN_SCORE,
                risk_level=SecurityService.calculate_risk_level(risk_score.total_score),
                event_metadata=json.dumps({
                    "attempt_number": risk_score.failed_login_count,
                    "email": user.email
                })
            )
            db.add(event)
            db.commit()
            
            print(f"✅ Recorded failed login for {user.email}")
            print(f"   Score: {risk_score.total_score}, Count: {risk_score.failed_login_count}")
            
            return event, risk_score
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error recording failed login: {e}")
            import traceback
            traceback.print_exc()
            raise

    @staticmethod
    def record_unauthorized_access(db: Session, user, page: str, ip_address: str = None):
        """Record unauthorized page access"""
        try:
            risk_score = db.query(UserRiskScore).filter(
                UserRiskScore.user_id == user.id
            ).first()
            
            if not risk_score:
                risk_score = UserRiskScore(user_id=user.id)
                db.add(risk_score)
                db.flush()
            
            risk_score.unauthorized_access_count += 1
            risk_score.last_unauthorized_access = datetime.utcnow()
            risk_score.total_score += SecurityService.UNAUTHORIZED_ACCESS_SCORE
            risk_score.updated_at = datetime.utcnow()
            
            company_name = getattr(user, 'company', None)
            
            event = SecurityEvent(
                user_id=user.id,
                company_name=company_name,
                event_type=EventType.UNAUTHORIZED_ACCESS,
                description=f"Unauthorized access attempt to {page} by {user.email}",
                ip_address=ip_address,
                risk_score=SecurityService.UNAUTHORIZED_ACCESS_SCORE,
                risk_level=SecurityService.calculate_risk_level(risk_score.total_score),
                event_metadata=json.dumps({
                    "page": page,
                    "user_email": user.email
                })
            )
            db.add(event)
            db.commit()
            
            print(f"✅ Recorded unauthorized access for {user.email}")
            return event, risk_score
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error recording unauthorized access: {e}")
            raise

    @staticmethod
    def get_security_events(
        db: Session, 
        company_name: str = None,
        event_type: str = None,
        is_resolved: bool = None,
        limit: int = 50
    ) -> List[SecurityEvent]:
        query = db.query(SecurityEvent)
        
        if company_name:
            query = query.filter(SecurityEvent.company_name == company_name)
        
        if event_type:
            query = query.filter(SecurityEvent.event_type == event_type)
        
        if is_resolved is not None:
            query = query.filter(SecurityEvent.is_resolved == (1 if is_resolved else 0))
        
        return query.order_by(SecurityEvent.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_top_risk_users(db: Session, limit: int = 10):
        return (
            db.query(UserRiskScore)
            .join(User)
            .order_by(UserRiskScore.total_score.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_security_summary(db: Session, company_name: str = None) -> Dict:
        query = db.query(SecurityEvent)
        
        if company_name:
            query = query.filter(SecurityEvent.company_name == company_name)
        
        today = datetime.utcnow().date()
        
        return {
            "alerts_today": query.filter(
                SecurityEvent.created_at >= today
            ).count(),
            "open_alerts": query.filter(
                SecurityEvent.is_resolved == 0
            ).count(),
            "resolved_alerts": query.filter(
                SecurityEvent.is_resolved == 1
            ).count(),
            "critical_alerts": query.filter(
                SecurityEvent.risk_level == RiskLevel.CRITICAL,
                SecurityEvent.is_resolved == 0
            ).count()
        }

    @staticmethod
    def resolve_alert(db: Session, event_id: int) -> bool:
        event = db.query(SecurityEvent).filter(SecurityEvent.id == event_id).first()
        if event:
            event.is_resolved = 1
            event.resolved_at = datetime.utcnow()
            db.commit()
            return True
        return False