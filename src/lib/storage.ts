"use client";

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

export interface Account {
    id: string;
    name: string;
    type: string;
}

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category_id: string;
    account_id: string;
    notes?: string;
    is_pending: boolean;
    credit_card_id?: string;
}

export interface CreditCard {
    id: string;
    name: string;
    limit: number;
    billing_cycle_start: number; // Day of month (1-31)
    due_date: number; // Day of month (1-31)
    current_balance: number;
    statement_balance: number;
    notes?: string;
    created_at: string;
}

export interface Lending {
    id: string;
    type: 'lent' | 'borrowed';
    person_name: string;
    original_amount: number;
    remaining_amount: number;
    status: 'active' | 'partially_repaid' | 'fully_repaid';
    date: string;
    repayment_date?: string;
    notes?: string;
    created_at: string;
}

export interface Repayment {
    id: string;
    lending_id: string;
    amount: number;
    date: string;
    note?: string;
}

const STORAGE_KEYS = {
    TRANSACTIONS: 'clarity_transactions',
    CATEGORIES: 'clarity_categories',
    ACCOUNTS: 'clarity_accounts',
    BUDGETS: 'clarity_budgets',
    CREDIT_CARDS: 'clarity_credit_cards',
    LENDING: 'clarity_lending',
    REPAYMENTS: 'clarity_repayments'
};

const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: "Food & Dining", type: "expense", icon: "utensils", color: "emerald" },
    { id: '2', name: "Shopping", type: "expense", icon: "shopping-bag", color: "purple" },
    { id: '3', name: "Housing", type: "expense", icon: "home", color: "blue" },
    { id: '4', name: "Transportation", type: "expense", icon: "car", color: "amber" },
    { id: '5', name: "Utilities", type: "expense", icon: "zap", color: "red" },
    { id: '6', name: "Entertainment", type: "expense", icon: "activity", color: "blue" },
    { id: '7', name: "Salary", type: "income", icon: "arrow-up-right", color: "emerald" },
    { id: '8', name: "Freelance", type: "income", icon: "briefcase", color: "emerald" }
];

const DEFAULT_ACCOUNTS: Account[] = [
    { id: '1', name: "Bank Account", type: "Bank" },
    { id: '2', name: "Cash", type: "Cash" },
    { id: '3', name: "UPI", type: "Digital" }
];

export const storage = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS)) {
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.LENDING)) {
            localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REPAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify([]));
        }
    },

    getTransactions: (): (Transaction & { category?: Category, account?: Account, creditCard?: CreditCard })[] => {
        if (typeof window === 'undefined') return [];
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const cats = storage.getCategories();
        const accs = storage.getAccounts();
        const cards = storage.getCreditCards();

        return txs.map((tx: any) => ({
            ...tx,
            category: cats.find(c => c.id === tx.category_id),
            account: accs.find(a => a.id === tx.account_id),
            creditCard: cards.find(c => c.id === tx.credit_card_id)
        }));
    },

    addTransaction: (tx: Omit<Transaction, 'id'>) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const id = Math.random().toString(36).substr(2, 9);
        const newTx = { ...tx, id };
        txs.push(newTx);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

        // If it's a credit card transaction, update card balance
        if (tx.credit_card_id) {
            console.log("Updating card balance for card:", tx.credit_card_id);
            const cards = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS) || '[]');
            const cardIndex = cards.findIndex((c: any) => c.id === tx.credit_card_id);
            if (cardIndex !== -1) {
                if (tx.type === 'expense') {
                    cards[cardIndex].current_balance += tx.amount;
                } else {
                    cards[cardIndex].current_balance -= tx.amount;
                }
                localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
                console.log("New balance for card:", cards[cardIndex].current_balance);
            } else {
                console.warn("Card not found for balance update:", tx.credit_card_id);
            }
        }

        return newTx;
    },

    deleteTransaction: (id: string) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const txToDelete = txs.find((t: any) => t.id === id);
        if (txToDelete && txToDelete.credit_card_id) {
            // Revert card balance
            storage.updateCardBalance(txToDelete.credit_card_id, -txToDelete.amount, txToDelete.type === 'expense');
        }
        const filtered = txs.filter((t: any) => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    },

    getCategories: (): Category[] => {
        if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || JSON.stringify(DEFAULT_CATEGORIES));
    },

    addCategory: (cat: Omit<Category, 'id'>) => {
        const cats = storage.getCategories();
        const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
        cats.push(newCat);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
        return newCat;
    },

    getAccounts: (): Account[] => {
        if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || JSON.stringify(DEFAULT_ACCOUNTS));
    },

    addAccount: (acc: Omit<Account, 'id'>) => {
        const accs = storage.getAccounts();
        const newAcc = { ...acc, id: Math.random().toString(36).substr(2, 9) };
        accs.push(newAcc);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accs));
        return newAcc;
    },

    // Credit Card Methods
    getCreditCards: (): CreditCard[] => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS) || '[]');
    },

    addCreditCard: (card: Omit<CreditCard, 'id' | 'current_balance' | 'statement_balance' | 'created_at'>) => {
        const cards = storage.getCreditCards();
        const newCard: CreditCard = {
            ...card,
            id: Math.random().toString(36).substr(2, 9),
            current_balance: 0,
            statement_balance: 0,
            created_at: new Date().toISOString()
        };
        cards.push(newCard);
        localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        return newCard;
    },

    updateCardBalance: (cardId: string, amount: number, isExpense: boolean) => {
        const cards = storage.getCreditCards();
        const cardIndex = cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            if (isExpense) {
                cards[cardIndex].current_balance += amount;
            } else {
                cards[cardIndex].current_balance -= amount;
            }
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        }
    },

    makeCardPayment: (cardId: string, amount: number, fromAccountId: string) => {
        const cards = storage.getCreditCards();
        const cardIndex = cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            cards[cardIndex].current_balance -= amount;
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));

            // Log as transaction
            storage.addTransaction({
                title: `Credit Card Payment: ${cards[cardIndex].name}`,
                amount: amount,
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                category_id: 'payment', // Special ID
                account_id: fromAccountId,
                notes: `Reduction of outstanding balance for ${cards[cardIndex].name}`,
                is_pending: false
            });
        }
    },

    // Lending Methods
    getLendingEntries: (): Lending[] => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LENDING) || '[]');
    },

    addLendingEntry: (entry: Omit<Lending, 'id' | 'remaining_amount' | 'status' | 'created_at'>) => {
        const entries = storage.getLendingEntries();
        const newEntry: Lending = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9),
            remaining_amount: entry.original_amount,
            status: 'active',
            created_at: new Date().toISOString()
        };
        entries.push(newEntry);
        localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify(entries));
        return newEntry;
    },

    addRepayment: (repayment: Omit<Repayment, 'id'>) => {
        const repayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPAYMENTS) || '[]');
        const newRepayment = { ...repayment, id: Math.random().toString(36).substr(2, 9) };
        repayments.push(newRepayment);
        localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(repayments));

        // Update lending entry balance
        const entries = storage.getLendingEntries();
        const entryIndex = entries.findIndex(e => e.id === repayment.lending_id);
        if (entryIndex !== -1) {
            entries[entryIndex].remaining_amount -= repayment.amount;
            if (entries[entryIndex].remaining_amount <= 0) {
                entries[entryIndex].status = 'fully_repaid';
            } else {
                entries[entryIndex].status = 'partially_repaid';
            }
            localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify(entries));
        }

        return newRepayment;
    },

    getRepaymentsForLending: (lendingId: string): Repayment[] => {
        const repayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPAYMENTS) || '[]');
        return repayments.filter((r: any) => r.lending_id === lendingId);
    }
};
