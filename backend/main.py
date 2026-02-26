from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Clarity Personal Finance API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Temporary function to seed db if empty
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if not db.query(models.Category).first():
        default_categories = [
            {"name": "Food & Dining", "type": "expense", "icon": "utensils", "color": "emerald"},
            {"name": "Shopping", "type": "expense", "icon": "shopping-bag", "color": "purple"},
            {"name": "Housing", "type": "expense", "icon": "home", "color": "blue"},
            {"name": "Transportation", "type": "expense", "icon": "car", "color": "amber"},
            {"name": "Utilities", "type": "expense", "icon": "zap", "color": "red"},
            {"name": "Entertainment", "type": "expense", "icon": "activity", "color": "blue"},
            {"name": "Salary", "type": "income", "icon": "arrow-up-right", "color": "emerald"},
            {"name": "Freelance", "type": "income", "icon": "briefcase", "color": "emerald"}
        ]
        for c in default_categories:
            crud.create_category(db, schemas.CategoryCreate(**c))
    
    if not db.query(models.Account).first():
        default_accounts = [
            {"name": "Credit Card", "type": "Credit Card"},
            {"name": "Bank Account", "type": "Bank"},
            {"name": "Cash", "type": "Cash"},
            {"name": "UPI", "type": "Digital"}
        ]
        for a in default_accounts:
            crud.create_account(db, schemas.AccountCreate(**a))
    db.close()


@app.get("/")
def read_root():
    return {"message": "Clarity Finance API running"}

# Accounts
@app.get("/api/accounts/", response_model=List[schemas.Account])
def read_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = crud.get_accounts(db, skip=skip, limit=limit)
    return accounts

@app.post("/api/accounts/", response_model=schemas.Account)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    return crud.create_account(db=db, account=account)

# Categories
@app.get("/api/categories/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.post("/api/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

# Transactions
@app.get("/api/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, skip=skip, limit=limit)
    return transactions

@app.post("/api/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@app.delete("/api/transactions/{transaction_id}", response_model=schemas.Transaction)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_tx = crud.delete_transaction(db, transaction_id=transaction_id)
    if db_tx is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_tx

# Budgets
@app.get("/api/budgets/", response_model=List[schemas.Budget])
def read_budgets(month: int, year: int, db: Session = Depends(get_db)):
    return crud.get_budgets(db, month=month, year=year)

@app.post("/api/budgets/", response_model=schemas.Budget)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    return crud.create_budget(db=db, budget=budget)

# Net Worth
@app.get("/api/net-worth/", response_model=List[schemas.NetWorthItem])
def read_net_worth_items(db: Session = Depends(get_db)):
    return crud.get_net_worth_items(db)

@app.post("/api/net-worth/", response_model=schemas.NetWorthItem)
def create_net_worth_item(item: schemas.NetWorthItemCreate, db: Session = Depends(get_db)):
    return crud.create_net_worth_item(db=db, item=item)
