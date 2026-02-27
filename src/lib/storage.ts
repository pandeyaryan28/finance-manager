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
}

export interface CreditCardSpend {
    id: string;
    card_id: string;
    title: string;
    amount: number;
    date: string;
    category_id: string;
    notes?: string;
}

export interface CreditCardRepayment {
    id: string;
    card_id: string;
    from_account_id: string;
    amount: number;
    date: string;
    notes?: string;
}

export interface CreditCard {
    id: string;
    name: string;
    limit: number;
    billing_cycle_start: number;
    due_date: number;
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
    CREDIT_SPENDS: 'clarity_credit_spends',
    CREDIT_REPAYMENTS: 'clarity_credit_repayments',
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
        if (!localStorage.getItem(STORAGE_KEYS.CREDIT_SPENDS)) {
            localStorage.setItem(STORAGE_KEYS.CREDIT_SPENDS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CREDIT_REPAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.CREDIT_REPAYMENTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.LENDING)) {
            localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REPAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify([]));
        }
    },

    getTransactions: (): (Transaction & { category?: Category, account?: Account })[] => {
        if (typeof window === 'undefined') return [];
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const cats = storage.getCategories();
        const accs = storage.getAccounts();

        return txs.map((tx: any) => ({
            ...tx,
            category: cats.find(c => c.id === tx.category_id),
            account: accs.find(a => a.id === tx.account_id)
        }));
    },

    addTransaction: (tx: Omit<Transaction, 'id'>) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const id = Math.random().toString(36).substr(2, 9);
        const newTx = { ...tx, id };
        txs.push(newTx);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        return newTx;
    },

    addIncome: (income: Omit<Transaction, 'id' | 'type'>) => {
        return storage.addTransaction({ ...income, type: 'income' });
    },

    addExpense: (expense: Omit<Transaction, 'id' | 'type'>) => {
        return storage.addTransaction({ ...expense, type: 'expense' });
    },

    deleteTransaction: (id: string) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const filtered = txs.filter((t: any) => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    },

    deleteCreditSpend: (id: string) => {
        const spends = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_SPENDS) || '[]');
        const spend = spends.find((s: any) => s.id === id);
        if (!spend) return;

        const filtered = spends.filter((s: any) => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.CREDIT_SPENDS, JSON.stringify(filtered));

        // Reverse card balance
        const cards = storage.getCreditCards();
        const cardIdx = cards.findIndex(c => c.id === spend.card_id);
        if (cardIdx !== -1) {
            cards[cardIdx].current_balance -= spend.amount;
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        }
    },

    deleteCreditRepayment: (id: string) => {
        const repayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_REPAYMENTS) || '[]');
        const repayment = repayments.find((r: any) => r.id === id);
        if (!repayment) return;

        const filtered = repayments.filter((r: any) => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.CREDIT_REPAYMENTS, JSON.stringify(filtered));

        // 1. Reverse card balance (Add debt back)
        const cards = storage.getCreditCards();
        const cardIdx = cards.findIndex(c => c.id === repayment.card_id);
        if (cardIdx !== -1) {
            cards[cardIdx].current_balance += repayment.amount;
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        }

        // 2. Remove the liquid transaction that was created
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        // We'll try to find it by title and amount and date, slightly risky but standard for this simple storage
        const liquidTxIdx = txs.findIndex((t: any) =>
            t.amount === repayment.amount &&
            t.date === repayment.date &&
            t.account_id === repayment.from_account_id
        );
        if (liquidTxIdx !== -1) {
            txs.splice(liquidTxIdx, 1);
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        }
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

    getCreditSpends: (): (CreditCardSpend & { card?: CreditCard, category?: Category })[] => {
        if (typeof window === 'undefined') return [];
        const spends = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_SPENDS) || '[]');
        const cards = storage.getCreditCards();
        const cats = storage.getCategories();
        return spends.map((s: any) => ({
            ...s,
            card: cards.find(c => c.id === s.card_id),
            category: cats.find(c => c.id === s.category_id)
        }));
    },

    addCreditSpend: (spend: Omit<CreditCardSpend, 'id'>) => {
        const spends = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_SPENDS) || '[]');
        const id = Math.random().toString(36).substr(2, 9);
        const newSpend = { ...spend, id };
        spends.push(newSpend);
        localStorage.setItem(STORAGE_KEYS.CREDIT_SPENDS, JSON.stringify(spends));

        // Update card balance
        const cards = storage.getCreditCards();
        const cardIdx = cards.findIndex(c => c.id === spend.card_id);
        if (cardIdx !== -1) {
            cards[cardIdx].current_balance += spend.amount;
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        }
        return newSpend;
    },

    getCreditRepayments: (): (CreditCardRepayment & { card?: CreditCard, account?: Account })[] => {
        if (typeof window === 'undefined') return [];
        const repayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_REPAYMENTS) || '[]');
        const cards = storage.getCreditCards();
        const accs = storage.getAccounts();
        return repayments.map((r: any) => ({
            ...r,
            card: cards.find(c => c.id === r.card_id),
            account: accs.find(a => a.id === r.from_account_id)
        }));
    },

    addCreditRepayment: (repayment: Omit<CreditCardRepayment, 'id'>) => {
        const repayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDIT_REPAYMENTS) || '[]');
        const id = Math.random().toString(36).substr(2, 9);
        const newRepayment = { ...repayment, id };
        repayments.push(newRepayment);
        localStorage.setItem(STORAGE_KEYS.CREDIT_REPAYMENTS, JSON.stringify(repayments));

        // 1. Update card balance (Reduce debt)
        const cards = storage.getCreditCards();
        const cardIdx = cards.findIndex(c => c.id === repayment.card_id);
        const cardName = cardIdx !== -1 ? cards[cardIdx].name : "Unknown Card";
        if (cardIdx !== -1) {
            cards[cardIdx].current_balance -= repayment.amount;
            localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
        }

        // 2. Add to regular transactions (as expense from liquid account)
        storage.addExpense({
            title: `CC Payment: ${cardName}`,
            amount: repayment.amount,
            date: repayment.date,
            category_id: 'repayment', // Special ID or handle UI
            account_id: repayment.from_account_id,
            is_pending: false,
            notes: repayment.notes || `Monthly bill payment for ${cardName}`
        });

        return newRepayment;
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
