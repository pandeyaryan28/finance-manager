from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime

from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'income' or 'expense'
    icon = Column(String, default="activity")
    color = Column(String, default="blue")

    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'Bank', 'Cash', 'Credit Card', 'UPI'

    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    type = Column(String) # 'income' or 'expense'
    date = Column(Date, default=datetime.date.today)
    notes = Column(String, nullable=True)
    is_pending = Column(Boolean, default=False)

    category_id = Column(Integer, ForeignKey("categories.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))

    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    month = Column(Integer)  # 1-12
    year = Column(Integer)
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="budgets")

class NetWorthItem(Base):
    __tablename__ = "net_worth_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    item_type = Column(String) # 'asset' or 'liability'
    category = Column(String) # e.g., 'Cash', 'Real Estate', 'Mortgage'
    amount = Column(Float)
    icon = Column(String, default="briefcase")
