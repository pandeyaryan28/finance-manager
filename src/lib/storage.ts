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

const STORAGE_KEYS = {
    TRANSACTIONS: 'clarity_transactions',
    CATEGORIES: 'clarity_categories',
    ACCOUNTS: 'clarity_accounts',
    BUDGETS: 'clarity_budgets',
    NET_WORTH: 'clarity_net_worth'
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
    { id: '3', name: "Credit Card", type: "Credit Card" },
    { id: '4', name: "UPI", type: "Digital" }
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
    },

    getTransactions: (): Transaction[] => {
        if (typeof window === 'undefined') return [];
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const cats = storage.getCategories();
        const accs = storage.getAccounts();

        // Joint data for UI convenience
        return txs.map((tx: any) => ({
            ...tx,
            category: cats.find(c => c.id === tx.category_id),
            account: accs.find(a => a.id === tx.account_id)
        }));
    },

    addTransaction: (tx: Omit<Transaction, 'id'>) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
        txs.push(newTx);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        return newTx;
    },

    deleteTransaction: (id: string) => {
        const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
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
    }
};
