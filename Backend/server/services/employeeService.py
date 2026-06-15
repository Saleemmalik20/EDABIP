from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.Employee import Employee, EmploymentStatus
from repositories.employeeRepository import EmployeeRepository
from datetime import datetime

class EmployeeService:
    @staticmethod
    def create_employee(db: Session, employee_data: dict) -> Employee:
        # Check if email already exists
        existing = EmployeeRepository.get_by_email(db, employee_data["email"])
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this email already exists"
            )

        # REMOVE THIS VALIDATION - Don't check if reporting manager exists
        # if employee_data.get("reporting_manager_id"):
        #     manager = EmployeeRepository.get_by_id(db, employee_data["reporting_manager_id"])
        #     if not manager:
        #         raise HTTPException(
        #             status_code=status.HTTP_400_BAD_REQUEST,
        #             detail="Reporting manager not found"
        #         )

        employee = Employee(**employee_data)
        return EmployeeRepository.create(db, employee)

    @staticmethod
    def get_all_employees(db: Session, department: str = None, search: str = None):
        if search:
            return EmployeeRepository.search(db, search)
        if department and department != "All":
            return EmployeeRepository.get_by_department(db, department)
        return EmployeeRepository.get_all(db)

    @staticmethod
    def get_employee_by_id(db: Session, employee_id: int) -> Employee:
        employee = EmployeeRepository.get_by_id(db, employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        return employee

    @staticmethod
    def update_employee(db: Session, employee_id: int, update_data: dict) -> Employee:
        employee = EmployeeRepository.get_by_id(db, employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )

        # Check email uniqueness if email is being updated
        if "email" in update_data and update_data["email"] != employee.email:
            existing = EmployeeRepository.get_by_email(db, update_data["email"])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Employee with this email already exists"
                )

        return EmployeeRepository.update(db, employee_id, update_data)

    @staticmethod
    def delete_employee(db: Session, employee_id: int):
        if not EmployeeRepository.delete(db, employee_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        return {"message": "Employee deleted successfully"}

    @staticmethod
    def get_employees_for_dropdown(db: Session):
        return EmployeeRepository.get_all_for_dropdown(db)

    @staticmethod
    def get_departments(db: Session):
        departments = db.query(Employee.department).distinct().all()
        return [dept[0] for dept in departments if dept[0]]