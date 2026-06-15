from sqlalchemy.orm import Session
from models.Employee import Employee, EmploymentStatus
from typing import List, Optional

class EmployeeRepository:
    @staticmethod
    def create(db: Session, employee: Employee) -> Employee:
        db.add(employee)
        db.commit()
        db.refresh(employee)
        return employee

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Employee]:
        return db.query(Employee).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, employee_id: int) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.id == employee_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.email == email).first()

    @staticmethod
    def get_by_department(db: Session, department: str) -> List[Employee]:
        return db.query(Employee).filter(Employee.department == department).all()

    @staticmethod
    def search(db: Session, query: str) -> List[Employee]:
        search_term = f"%{query}%"
        return db.query(Employee).filter(
            (Employee.full_name.ilike(search_term)) |
            (Employee.email.ilike(search_term)) |
            (Employee.role.ilike(search_term))
        ).all()

    @staticmethod
    def update(db: Session, employee_id: int, update_data: dict) -> Optional[Employee]:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            for key, value in update_data.items():
                setattr(employee, key, value)
            db.commit()
            db.refresh(employee)
        return employee

    @staticmethod
    def delete(db: Session, employee_id: int) -> bool:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            db.delete(employee)
            db.commit()
            return True
        return False

    @staticmethod
    def get_all_for_dropdown(db: Session) -> List[Employee]:
        """Get all active employees for the reporting manager dropdown"""
        return db.query(Employee).filter(
            Employee.status == EmploymentStatus.ACTIVE
        ).order_by(Employee.full_name).all()