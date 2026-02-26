from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date

def get_accounts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Account).offset(skip).limit(limit).all()

def create_account(db: Session, account: schemas.AccountCreate):
    db_account = models.Account(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int):
    db_tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_tx:
        db.delete(db_tx)
        db.commit()
    return db_tx

def get_budgets(db: Session, month: int, year: int):
    return db.query(models.Budget).filter(models.Budget.month == month, models.Budget.year == year).all()

def create_budget(db: Session, budget: schemas.BudgetCreate):
    db_budget = models.Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_net_worth_items(db: Session):
    return db.query(models.NetWorthItem).all()

def create_net_worth_item(db: Session, item: schemas.NetWorthItemCreate):
    db_item = models.NetWorthItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
