from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from config.db import Base

class EmploymentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Basic Info
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    role = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=True)

    # Employment - Remove foreign key constraint
    reporting_manager_id = Column(Integer, nullable=True)  # Removed ForeignKey
    reporting_manager_name = Column(String(100), nullable=True)  # Store manager name
    status = Column(Enum(EmploymentStatus), default=EmploymentStatus.ACTIVE, nullable=False)
    joined_date = Column(Date, nullable=False)

    # Leave tracking
    total_leave = Column(Integer, default=20, nullable=False)
    used_leave = Column(Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<Employee(id={self.id}, name={self.full_name})>"