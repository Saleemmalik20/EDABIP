from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.db import Base

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EventType(str, enum.Enum):
    FAILED_LOGIN = "failed_login"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_EXPORT = "data_export"
    PASSWORD_CHANGE = "password_change"
    PROFILE_UPDATE = "profile_update"

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_name = Column(String(100), nullable=True)
    
    # Event details - Added values_callable to use lowercase enum values
    event_type = Column(
        Enum(EventType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    description = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Risk scoring - Added values_callable for risk_level too
    risk_score = Column(Integer, default=0)
    risk_level = Column(
        Enum(RiskLevel, values_callable=lambda x: [e.value for e in x]),
        default=RiskLevel.LOW
    )
    
    # Metadata - Maps Python attribute 'event_metadata' to DB column 'metadata'
    event_metadata = Column(Text, nullable=True)
    
    is_resolved = Column(Integer, default=0)
    resolved_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<SecurityEvent(id={self.id}, type={self.event_type}, risk={self.risk_level})>"