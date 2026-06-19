from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from config.db import Base

class UserRiskScore(Base):
    __tablename__ = "user_risk_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Risk score
    total_score = Column(Integer, default=0)
    failed_login_count = Column(Integer, default=0)
    unauthorized_access_count = Column(Integer, default=0)
    
    # Last event timestamps
    last_failed_login = Column(DateTime, nullable=True)
    last_unauthorized_access = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<UserRiskScore(user_id={self.user_id}, score={self.total_score})>"