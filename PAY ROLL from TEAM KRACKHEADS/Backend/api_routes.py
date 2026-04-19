"""
API routes for employer dashboard: employees, transactions, bonuses, treasury, dashboard, settings.
All routes require JWT authentication (employer role).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from typing import List

from database import db
from models import (
    Employee,
    Transaction,
    Bonus,
    Treasury,
    CompanySettings,
    TaxSlab,
    User,
)
from schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeTaxUpdate,
    EmployeeWalletUpdate,
    TransactionCreate,
    TransactionResponse,
    BonusCreate,
    BonusResponse,
    TreasuryAction,
    CompanySettingsResponse,
    CompanySettingsUpdate,
    TaxSlabCreate,
    TaxSlabResponse,
)
from security import SecurityService
from service import (
    EmployeeService,
    TransactionService,
    BonusService,
    TreasuryService,
    TaxService,
    DashboardService,
    StreamingService,
)

router = APIRouter()


# =========================
# EMPLOYEES
# =========================

@router.get("/employees/", response_model=List[EmployeeResponse])
def list_employees(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    employees = session.query(Employee).all()
    return [
        EmployeeResponse(
            id=e.id,
            name=e.name,
            email=e.email,
            role=e.role,
            is_streaming=e.is_streaming or False,
            wallet_address=e.wallet_address,
            use_custom_tax=e.use_custom_tax or False,
            custom_tax_rate=e.custom_tax_rate,
            transactions=[],
        )
        for e in employees
    ]


@router.post("/employees/", response_model=EmployeeResponse)
def create_employee(
    data: EmployeeCreate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    try:
        emp = EmployeeService.create_employee(
            session, data.name, data.email, data.role
        )
        return EmployeeResponse(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role=emp.role,
            is_streaming=emp.is_streaming or False,
            wallet_address=emp.wallet_address,
            use_custom_tax=emp.use_custom_tax or False,
            custom_tax_rate=emp.custom_tax_rate,
            transactions=[],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    emp = EmployeeService.get_employee(session, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    transactions = [
        TransactionResponse(
            id=t.id,
            employee_id=t.employee_id,
            amount=t.amount,
            tax_amount=t.tax_amount,
            description=t.description or "",
            timestamp=t.timestamp,
        )
        for t in emp.transactions
    ]
    return EmployeeResponse(
        id=emp.id,
        name=emp.name,
        email=emp.email,
        role=emp.role,
        is_streaming=emp.is_streaming or False,
        wallet_address=emp.wallet_address,
        use_custom_tax=emp.use_custom_tax or False,
        custom_tax_rate=emp.custom_tax_rate,
        transactions=transactions,
    )


@router.get("/employees/{employee_id}/transactions", response_model=List[TransactionResponse])
def get_employee_transactions(
    employee_id: int,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    emp = EmployeeService.get_employee(session, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return [
        TransactionResponse(
            id=t.id,
            employee_id=t.employee_id,
            amount=t.amount,
            tax_amount=t.tax_amount,
            description=t.description or "",
            timestamp=t.timestamp,
        )
        for t in emp.transactions
    ]


@router.put("/employees/{employee_id}/wallet")
def update_employee_wallet(
    employee_id: int,
    data: EmployeeWalletUpdate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    """Set employee's on-chain wallet address (for CorePayroll)."""
    emp = EmployeeService.get_employee(session, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.wallet_address = data.wallet_address
    session.commit()
    session.refresh(emp)
    return {"message": "Wallet updated", "wallet_address": emp.wallet_address}


@router.put("/employees/{employee_id}/tax")
def update_employee_tax(
    employee_id: int,
    data: EmployeeTaxUpdate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    emp = EmployeeService.get_employee(session, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.use_custom_tax = data.use_custom_tax
    emp.custom_tax_rate = float(data.custom_tax_rate) if data.custom_tax_rate is not None else None
    session.commit()
    session.refresh(emp)
    return {"message": "Tax updated"}


# =========================
# STREAM
# =========================

@router.post("/stream/start/{employee_id}")
def start_stream(
    employee_id: int,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return StreamingService.start_stream(session, employee_id)


@router.post("/stream/pause/{employee_id}")
def pause_stream(
    employee_id: int,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return StreamingService.pause_stream(session, employee_id)


# =========================
# TRANSACTIONS (Salary)
# =========================

@router.post("/transactions/", response_model=TransactionResponse)
def create_transaction(
    data: TransactionCreate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    try:
        tx = TransactionService.create_transaction(
            session,
            data.employee_id,
            float(data.amount),
            data.description,
        )
        return TransactionResponse(
            id=tx.id,
            employee_id=tx.employee_id,
            amount=tx.amount,
            tax_amount=tx.tax_amount,
            description=tx.description or "",
            timestamp=tx.timestamp,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =========================
# BONUSES
# =========================

@router.post("/bonuses/{employee_id}", response_model=BonusResponse)
def give_bonus(
    employee_id: int,
    data: BonusCreate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    try:
        bonus = BonusService.give_bonus(
            session,
            employee_id,
            float(data.amount),
            data.reason,
        )
        return BonusResponse(
            id=bonus.id,
            employee_id=bonus.employee_id,
            amount=bonus.amount,
            reason=bonus.reason or "",
            created_at=bonus.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =========================
# TREASURY
# =========================

@router.get("/treasury")
def get_treasury(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    treasury = TreasuryService.get_or_create(session)
    return {
        "id": treasury.id,
        "total_balance": float(treasury.total_balance),
        "onchain_balance": float(treasury.onchain_balance),
        "last_tx_hash": treasury.last_tx_hash,
        "last_synced_at": treasury.last_synced_at.isoformat() if treasury.last_synced_at else None,
    }


@router.post("/treasury/deposit")
def deposit_treasury(
    data: TreasuryAction,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    try:
        treasury = TreasuryService.deposit_web2(session, float(data.amount))
        return {
            "id": treasury.id,
            "total_balance": float(treasury.total_balance),
            "onchain_balance": float(treasury.onchain_balance),
        }
    except HTTPException:
        raise


@router.post("/treasury/withdraw")
def withdraw_treasury(
    data: TreasuryAction,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    try:
        treasury = TreasuryService.withdraw_web2(session, float(data.amount))
        return {
            "id": treasury.id,
            "total_balance": float(treasury.total_balance),
            "onchain_balance": float(treasury.onchain_balance),
        }
    except HTTPException:
        raise


# =========================
# DASHBOARD
# =========================

@router.get("/dashboard/total-payout")
def total_payout(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return DashboardService.total_payout(session)


@router.get("/dashboard/total-tax")
def total_tax(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return DashboardService.total_tax_collected(session)


@router.get("/dashboard/active-streams")
def active_streams(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return DashboardService.active_streams(session)


@router.get("/dashboard/top-earners")
def top_earners(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return DashboardService.top_earners(session)


@router.get("/dashboard/monthly-summary")
def monthly_summary(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    return DashboardService.monthly_summary(session)


# =========================
# SETTINGS
# =========================

@router.get("/settings/company-tax", response_model=CompanySettingsResponse)
def get_company_tax(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    settings = session.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings(default_tax_rate=Decimal("10.00"))
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return CompanySettingsResponse(default_tax_rate=settings.default_tax_rate)


@router.post("/settings/company-tax", response_model=CompanySettingsResponse)
def update_company_tax(
    data: CompanySettingsUpdate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    settings = session.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings(default_tax_rate=data.default_tax_rate)
        session.add(settings)
    else:
        settings.default_tax_rate = data.default_tax_rate
    session.commit()
    session.refresh(settings)
    return CompanySettingsResponse(default_tax_rate=settings.default_tax_rate)


@router.get("/settings/tax-slabs", response_model=List[TaxSlabResponse])
def get_tax_slabs(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    slabs = session.query(TaxSlab).all()
    return [
        TaxSlabResponse(
            id=s.id,
            min_income=s.min_income,
            max_income=s.max_income,
            tax_rate=s.tax_rate,
        )
        for s in slabs
    ]


@router.post("/settings/tax-slabs", response_model=TaxSlabResponse)
def create_tax_slab(
    data: TaxSlabCreate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    slab = TaxSlab(
        min_income=data.min_income,
        max_income=data.max_income,
        tax_rate=data.tax_rate,
    )
    session.add(slab)
    session.commit()
    session.refresh(slab)
    return TaxSlabResponse(
        id=slab.id,
        min_income=slab.min_income,
        max_income=slab.max_income,
        tax_rate=slab.tax_rate,
    )


@router.delete("/settings/tax-slabs/{slab_id}")
def delete_tax_slab(
    slab_id: int,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    slab = session.query(TaxSlab).filter(TaxSlab.id == slab_id).first()
    if not slab:
        raise HTTPException(status_code=404, detail="Tax slab not found")
    session.delete(slab)
    session.commit()
    return {"message": "Deleted"}


# =========================
# EMPLOYEE SELF-SERVICE (for Frontendemployee)
# =========================

@router.get("/me/transactions", response_model=List[TransactionResponse])
def get_my_transactions(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    """Returns transactions for the employee matching current user's email."""
    emp = session.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        return []
    return [
        TransactionResponse(
            id=t.id,
            employee_id=t.employee_id,
            amount=t.amount,
            tax_amount=t.tax_amount,
            description=t.description or "",
            timestamp=t.timestamp,
        )
        for t in emp.transactions
    ]


@router.get("/me/profile")
def get_my_profile(
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    """Returns the employee profile for the current user."""
    emp = session.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        return {
            "email": current_user.email,
            "role": current_user.role,
            "employee": None,
            "total_earned": 0,
        }
    total_earned = (
        session.query(func.sum(Transaction.amount))
        .filter(Transaction.employee_id == emp.id)
        .scalar()
        or 0
    )
    return {
        "email": current_user.email,
        "role": current_user.role,
        "employee": {
            "id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "role": emp.role,
            "is_streaming": emp.is_streaming,
        },
        "total_earned": float(total_earned),
    }


@router.put("/me/wallet")
def update_my_wallet(
    data: EmployeeWalletUpdate,
    session: Session = Depends(db.get_db),
    current_user: User = Depends(SecurityService.get_current_user),
):
    emp = session.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    wallet = (data.wallet_address or "").strip()
    if wallet and not wallet.startswith("0x"):
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    emp.wallet_address = wallet or None
    session.commit()
    session.refresh(emp)
    return {"message": "Wallet updated", "wallet_address": emp.wallet_address}
