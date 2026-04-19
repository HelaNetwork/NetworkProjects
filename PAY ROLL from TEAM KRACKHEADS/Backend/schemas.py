from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
from decimal import Decimal


# =====================================================
# TRANSACTIONS
# =====================================================

class TransactionBase(BaseModel):
    amount: Decimal
    description: str


class TransactionCreate(TransactionBase):
    employee_id: int


class TransactionResponse(BaseModel):
    id: int
    employee_id: int
    amount: Decimal
    tax_amount: Decimal
    description: str
    timestamp: datetime

    model_config = {"from_attributes": True}


# =====================================================
# BONUS
# =====================================================

class BonusCreate(BaseModel):
    amount: Decimal
    reason: str


class BonusResponse(BaseModel):
    id: int
    employee_id: int
    amount: Decimal
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


# =====================================================
# TREASURY ACTION
# =====================================================

class TreasuryAction(BaseModel):
    amount: Decimal


# =====================================================
# EMPLOYEES
# =====================================================

class EmployeeCreate(BaseModel):
    name: str
    email: str
    role: str = "employee"


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    is_streaming: bool = False
    wallet_address: Optional[str] = None
    use_custom_tax: bool = False
    custom_tax_rate: Optional[Decimal] = None

    transactions: List[TransactionResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# =====================================================
# EMPLOYEE TAX UPDATE
# =====================================================

class EmployeeTaxUpdate(BaseModel):
    use_custom_tax: bool
    custom_tax_rate: Optional[Decimal] = None


class EmployeeWalletUpdate(BaseModel):
    wallet_address: str


# =====================================================
# COMPANY SETTINGS
# =====================================================

class CompanySettingsResponse(BaseModel):
    default_tax_rate: Decimal

    model_config = {"from_attributes": True}


class CompanySettingsUpdate(BaseModel):
    default_tax_rate: Decimal


# =====================================================
# TAX SLAB
# =====================================================

class TaxSlabCreate(BaseModel):
    min_income: Decimal
    max_income: Optional[Decimal] = None
    tax_rate: Decimal


class TaxSlabResponse(BaseModel):
    id: int
    min_income: Decimal
    max_income: Optional[Decimal]
    tax_rate: Decimal

    model_config = {"from_attributes": True}


# =====================================================
# USERS
# =====================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
