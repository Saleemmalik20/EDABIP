from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from config.db import get_db
from middleware.authMiddleware import get_current_user
from models.User import User
from services.employeeService import EmployeeService
from datetime import date

router = APIRouter(prefix="/employees", tags=["Employees"])

class EmployeeCreateSchema(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    department: str
    phone: Optional[str] = None
    reporting_manager_id: Optional[int] = None
    reporting_manager_name: Optional[str] = None  # Add this
    status: str = "active"
    joined_date: date
    total_leave: int = 20
    used_leave: int = 0

class EmployeeUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    reporting_manager_id: Optional[int] = None
    reporting_manager_name: Optional[str] = None  # Add this
    status: Optional[str] = None
    joined_date: Optional[date] = None

@router.get("/")
def get_employees(
    department: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employees = EmployeeService.get_all_employees(db, department, search)
    return [
        {
            "id": e.id,
            "full_name": e.full_name,
            "email": e.email,
            "role": e.role,
            "department": e.department,
            "phone": e.phone,
            "status": e.status.value,
            "joined_date": e.joined_date.isoformat() if e.joined_date else None,
            "reporting_manager_name": e.reporting_manager_name,  # Return manager name
            "total_leave": e.total_leave,
            "used_leave": e.used_leave,
            "remaining_leave": e.total_leave - e.used_leave
        } for e in employees
    ]

@router.get("/dropdown")
def get_employees_dropdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employees = EmployeeService.get_employees_for_dropdown(db)
    return [
        {
            "id": e.id,
            "full_name": e.full_name,
            "role": e.role,
            "label": f"{e.full_name} ({e.role})"
        } for e in employees
    ]

@router.get("/departments")
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return EmployeeService.get_departments(db)

@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = EmployeeService.get_employee_by_id(db, employee_id)
    return {
        "id": employee.id,
        "full_name": employee.full_name,
        "email": employee.email,
        "role": employee.role,
        "department": employee.department,
        "phone": employee.phone,
        "status": employee.status.value,
        "joined_date": employee.joined_date.isoformat() if employee.joined_date else None,
        "reporting_manager_name": employee.reporting_manager_name,  # Return manager name
        "total_leave": employee.total_leave,
        "used_leave": employee.used_leave,
        "remaining_leave": employee.total_leave - employee.used_leave,
        "attendance": {
            "present": 1,
            "absent": 0,
            "late": 0
        }
    }

@router.post("/", status_code=201)
def create_employee(
    employee_data: EmployeeCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = EmployeeService.create_employee(db, employee_data.dict())
    return {
        "message": "Employee created successfully",
        "employee_id": employee.id
    }

@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_dict = {k: v for k, v in employee_data.dict().items() if v is not None}
    employee = EmployeeService.update_employee(db, employee_id, update_dict)
    return {"message": "Employee updated successfully"}

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return EmployeeService.delete_employee(db, employee_id)