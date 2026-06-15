from sqlalchemy import Column, Integer, String, Enum, Index
import enum
from config.db import Base

class RoleType(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class StatusType(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    company = Column(String(100), nullable=False, index=True)
    
    # Added values_callable to force DB to use 'admin'/'user' instead of 'ADMIN'/'USER'
    role = Column(Enum(RoleType, values_callable=lambda x: [e.value for e in x]), default=RoleType.USER, nullable=False)
    status = Column(Enum(StatusType, values_callable=lambda x: [e.value for e in x]), default=StatusType.ACTIVE, nullable=False)

    __table_args__ = (
        Index('idx_users_company', 'company'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, company={self.company})>"