from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey,
    DateTime,
    Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import db

Base = db.Base


# ===============================
# EMPLOYEE
# ===============================
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(50), default="employee")

    is_streaming = Column(Boolean, default=False)

    # On-chain wallet address (for CorePayroll contract)
    wallet_address = Column(String(42), nullable=True)

    # 🔥 Simple Tax System
    use_custom_tax = Column(Boolean, default=False)
    custom_tax_rate = Column(Numeric(5, 2), nullable=True)

    transactions = relationship(
        "Transaction",
        back_populates="employee",
        cascade="all, delete-orphan"
    )

    bonuses = relationship(
        "Bonus",
        back_populates="employee",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Employee {self.name}>"


# ===============================
# TRANSACTIONS (Net + Tax Stored)
# ===============================
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    amount = Column(Numeric(12, 2), nullable=False)     # Net amount paid
    tax_amount = Column(Numeric(12, 2), default=0)     # Tax withheld

    description = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)

    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee = relationship("Employee", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction net={self.amount} tax={self.tax_amount} emp={self.employee_id}>"


# ===============================
# BONUS (Stores Gross Amount)
# ===============================
class Bonus(Base):
    __tablename__ = "bonuses"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employees.id"))
    amount = Column(Numeric(12, 2), nullable=False)  # Gross bonus

    reason = Column(String(255))
    tx_hash = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="bonuses")

    def __repr__(self):
        return f"<Bonus gross={self.amount} emp={self.employee_id}>"


# ===============================
# COMPANY SETTINGS
# ===============================
class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True)
    default_tax_rate = Column(Numeric(5, 2), default=10.00)


# ===============================
# TAX SLAB (Progressive Tax)
# ===============================
class TaxSlab(Base):
    __tablename__ = "tax_slabs"

    id = Column(Integer, primary_key=True, index=True)
    min_income = Column(Numeric(14, 2), nullable=False)
    max_income = Column(Numeric(14, 2), nullable=True)
    tax_rate = Column(Numeric(5, 2), nullable=False)


# ===============================
# TREASURY
# ===============================
class Treasury(Base):
    __tablename__ = "treasury"

    id = Column(Integer, primary_key=True)

    total_balance = Column(Numeric(14, 2), default=0.00)
    onchain_balance = Column(Numeric(14, 2), default=0.00)

    last_tx_hash = Column(String(255), nullable=True)
    last_synced_at = Column(DateTime, nullable=True)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# ===============================
# BLOCKCHAIN TRANSACTION LOG
# ===============================
class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"

    id = Column(Integer, primary_key=True, index=True)

    tx_hash = Column(String(255), unique=True, index=True, nullable=False)
    tx_type = Column(String(50), nullable=False)
    status = Column(String(30), default="pending")

    created_at = Column(DateTime, default=datetime.utcnow)


# ===============================
# USER (Authentication)
# ===============================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="employee")

    def __repr__(self):
        return f"<User {self.email}>"
