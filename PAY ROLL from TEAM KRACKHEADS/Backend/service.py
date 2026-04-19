from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from datetime import datetime
from fastapi import HTTPException

from models import (
    Employee,
    Transaction,
    Treasury,
    BlockchainTransaction,
    Bonus,
    CompanySettings
)
from config import settings

# =====================================================
# EMPLOYEE SERVICE
# =====================================================
class EmployeeService:

    @staticmethod
    def create_employee(db: Session, name: str, email: str, role: str):
        existing = db.query(Employee).filter(Employee.email == email).first()
        if existing:
            raise ValueError("Email already exists")

        employee = Employee(name=name, email=email, role=role)

        try:
            db.add(employee)
            db.commit()
            db.refresh(employee)
            return employee
        except IntegrityError:
            db.rollback()
            raise


    @staticmethod
    def get_employee(db: Session, employee_id: int):
        return db.query(Employee).filter(Employee.id == employee_id).first()


    @staticmethod
    def delete_employee(db: Session, employee_id: int):
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError("Employee not found")

        db.delete(employee)
        db.commit()


# =====================================================
# TAX SERVICE (CUSTOM → COMPANY DEFAULT ONLY)
# =====================================================
class TaxService:

    @staticmethod
    def calculate_tax(db: Session, employee: Employee, gross_amount: float):

        # 1️⃣ Employee custom override
        if employee.use_custom_tax and employee.custom_tax_rate:
            rate = float(employee.custom_tax_rate)
            return (gross_amount * rate) / 100.0

        # 2️⃣ Company default tax
        company_settings = db.query(CompanySettings).first()
        rate = float(company_settings.default_tax_rate) if company_settings else float(settings.TAX_RATE)

        return (gross_amount * rate) / 100.0


# =====================================================
# TREASURY SERVICE
# =====================================================
class TreasuryService:

    @staticmethod
    def get_or_create(db: Session):
        treasury = db.query(Treasury).first()
        if not treasury:
            treasury = Treasury(total_balance=0.0, onchain_balance=0.0)
            db.add(treasury)
            db.commit()
            db.refresh(treasury)
        return treasury


    @staticmethod
    def deposit_web2(db: Session, amount: float):
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")

        treasury = TreasuryService.get_or_create(db)
        treasury.total_balance += amount

        db.commit()
        db.refresh(treasury)
        return treasury


    @staticmethod
    def withdraw_web2(db: Session, amount: float):
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")

        treasury = TreasuryService.get_or_create(db)

        if treasury.total_balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        treasury.total_balance -= amount

        db.commit()
        db.refresh(treasury)
        return treasury


# =====================================================
# TRANSACTION SERVICE (SALARY)
# =====================================================
class TransactionService:

    @staticmethod
    def create_transaction(db: Session, employee_id: int, gross_amount: float, description: str):

        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        if not employee.is_streaming:
            raise HTTPException(status_code=400, detail="Stream is not active")

        if gross_amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")

        treasury = TreasuryService.get_or_create(db)

        tax_amount = TaxService.calculate_tax(db, employee, gross_amount)
        net_amount = gross_amount - tax_amount

        if treasury.total_balance < net_amount:
            raise HTTPException(status_code=400, detail="Insufficient treasury funds")

        treasury.total_balance -= net_amount

        transaction = Transaction(
            employee_id=employee_id,
            amount=net_amount,
            tax_amount=tax_amount,
            description=description
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction


# =====================================================
# BONUS SERVICE
# =====================================================
class BonusService:

    @staticmethod
    def give_bonus(db: Session, employee_id: int, gross_amount: float, reason: str):

        if gross_amount <= 0:
            raise HTTPException(status_code=400, detail="Bonus must be positive")

        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        treasury = TreasuryService.get_or_create(db)

        tax_amount = TaxService.calculate_tax(db, employee, gross_amount)
        net_amount = gross_amount - tax_amount

        if treasury.total_balance < net_amount:
            raise HTTPException(status_code=400, detail="Insufficient treasury funds")

        treasury.total_balance -= net_amount

        bonus = Bonus(
            employee_id=employee_id,
            amount=gross_amount,
            reason=reason
        )

        transaction = Transaction(
            employee_id=employee_id,
            amount=net_amount,
            tax_amount=tax_amount,
            description=f"Bonus: {reason}"
        )

        db.add(bonus)
        db.add(transaction)

        db.commit()
        db.refresh(bonus)

        return bonus


# =====================================================
# DASHBOARD SERVICE
# =====================================================
class DashboardService:

    @staticmethod
    def total_payout(db: Session):
        total_net = db.query(func.sum(Transaction.amount)).scalar() or 0
        return {"total_paid_net": float(total_net)}

    @staticmethod
    def total_tax_collected(db: Session):
        total_tax = db.query(func.sum(Transaction.tax_amount)).scalar() or 0
        return {"total_tax_collected": float(total_tax)}

    @staticmethod
    def active_streams(db: Session):
        count = db.query(func.count(Employee.id)) \
                  .filter(Employee.is_streaming == True) \
                  .scalar() or 0
        return {"active_streams": int(count)}

    @staticmethod
    def top_earners(db: Session):
        results = (
            db.query(Employee.name, func.sum(Transaction.amount))
            .join(Transaction)
            .group_by(Employee.id)
            .order_by(func.sum(Transaction.amount).desc())
            .all()
        )

        return [{"name": r[0], "total_net": float(r[1] or 0)} for r in results]

    @staticmethod
    def monthly_summary(db: Session):
        dialect = (db.bind.dialect.name if db.bind else "sqlite").lower()
        if dialect in ("sqlite"):
            month_expr = func.strftime("%Y-%m", Transaction.timestamp)
        elif dialect in ("mysql", "mariadb"):
            month_expr = func.date_format(Transaction.timestamp, "%Y-%m")
        elif dialect in ("postgresql", "postgres"):
            month_expr = func.to_char(Transaction.timestamp, "YYYY-MM")
        else:
            month_expr = func.strftime("%Y-%m", Transaction.timestamp)
        results = (
            db.query(
                month_expr.label("month"),
                func.sum(Transaction.amount).label("income"),
                func.sum(Transaction.tax_amount).label("tax"),
            )
            .group_by(month_expr)
            .order_by("month")
            .all()
        )
        out = []
        for r in results:
            month_val = r[0] if r[0] else "0000-00"
            income = float(r[1] or 0)
            tax = float(r[2] or 0)
            out.append({
                "month": month_val,
                "income": income,
                "tax": tax,
                "net": income,
            })
        return out

# =====================================================
# STREAMING SERVICE
# =====================================================
class StreamingService:

    @staticmethod
    def start_stream(db: Session, employee_id: int):
        employee = db.query(Employee).filter(Employee.id == employee_id).first()

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        employee.is_streaming = True

        db.commit()
        db.refresh(employee)

        return {
            "success": True,
            "employee_id": employee.id,
            "is_streaming": employee.is_streaming,
        }

    @staticmethod
    def pause_stream(db: Session, employee_id: int):
        employee = db.query(Employee).filter(Employee.id == employee_id).first()

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        employee.is_streaming = False

        db.commit()
        db.refresh(employee)

        return {
            "success": True,
            "employee_id": employee.id,
            "is_streaming": employee.is_streaming,
        }


