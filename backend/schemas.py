from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# Account
class AccountBase(BaseModel):
    name: str
    type: str

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: int
    class Config:
        from_attributes = True

# Category
class CategoryBase(BaseModel):
    name: str
    type: str
    icon: str = "activity"
    color: str = "blue"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# Transaction
class TransactionBase(BaseModel):
    title: str
    amount: float
    type: str # 'income' or 'expense'
    date: date
    notes: Optional[str] = None
    is_pending: bool = False
    category_id: int
    account_id: int

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    category: Optional[Category] = None
    account: Optional[Account] = None
    class Config:
        from_attributes = True

# Budget
class BudgetBase(BaseModel):
    amount: float
    month: int
    year: int
    category_id: int

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    category: Optional[Category] = None
    class Config:
        from_attributes = True

# Net Worth Item
class NetWorthItemBase(BaseModel):
    name: str
    item_type: str # 'asset' or 'liability'
    category: str
    amount: float
    icon: str = "briefcase"

class NetWorthItemCreate(NetWorthItemBase):
    pass

class NetWorthItem(NetWorthItemBase):
    id: int
    class Config:
        from_attributes = True
