"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings as SettingsIcon,
    Wallet,
    Tag,
    Plus,
    Trash2,
    Landmark,
    Banknote,
    CreditCard,
    Smartphone
} from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Account, Category } from "@/lib/storage";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 } as any
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 350, damping: 25 } as any
    }
};

export default function SettingsPage() {
    const { openModal } = useModal();
    const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        try {
            setAccounts(storage.getAccounts());
            setCategories(storage.getCategories());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteAccount = (id: string) => {
        if (!confirm("Delete this account? Transactions linked to it will no longer reference an account.")) return;
        storage.deleteAccount(id);
        setAccounts(storage.getAccounts());
    };

    const handleDeleteCategory = (id: string) => {
        if (!confirm("Delete this category? Transactions linked to it will no longer reference a category.")) return;
        storage.deleteCategory(id);
        setCategories(storage.getCategories());
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'Bank': return <Landmark className="w-4 h-4" />;
            case 'Credit Card': return <CreditCard className="w-4 h-4" />;
            case 'Digital': case 'UPI': return <Smartphone className="w-4 h-4" />;
            default: return <Banknote className="w-4 h-4" />;
        }
    };

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500'
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500" />
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <SettingsIcon className="w-7 h-7 text-blue-500" />
                        Settings
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage your accounts and categories.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'accounts' ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-color)]"}`}
                >
                    <Wallet className="w-4 h-4" />
                    Accounts
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'categories' ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-color)]"}`}
                >
                    <Tag className="w-4 h-4" />
                    Categories
                </button>
            </div>

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
                <motion.div
                    key="accounts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Your Accounts</h2>
                        <button
                            onClick={() => openModal("add-account")}
                            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Add Account
                        </button>
                    </div>

                    <div className="grid gap-3">
                        <AnimatePresence mode="popLayout">
                            {accounts.map((acc) => (
                                <motion.div
                                    key={acc.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    className="card p-4 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                            {getAccountIcon(acc.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{acc.name}</h3>
                                            <p className="text-xs text-[var(--text-muted)] font-medium">{acc.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAccount(acc.id)}
                                        className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete account"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {accounts.length === 0 && (
                            <div className="h-32 flex items-center justify-center text-[var(--text-muted)] card border-dashed">
                                <p className="text-sm font-medium">No accounts yet. Add one to get started.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Your Categories</h2>
                        <button
                            onClick={() => openModal("add-category")}
                            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>

                    {/* Split by type */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">Expense Categories</h3>
                            <div className="grid gap-3">
                                <AnimatePresence mode="popLayout">
                                    {categories.filter(c => c.type === 'expense').map((cat) => (
                                        <motion.div
                                            key={cat.id}
                                            layout
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                            className="card p-4 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${colorMap[cat.color] || 'bg-gray-500'}`} />
                                                <div>
                                                    <h3 className="font-bold text-sm">{cat.name}</h3>
                                                    <p className="text-xs text-[var(--text-muted)] font-medium capitalize">{cat.type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">Income Categories</h3>
                            <div className="grid gap-3">
                                <AnimatePresence mode="popLayout">
                                    {categories.filter(c => c.type === 'income').map((cat) => (
                                        <motion.div
                                            key={cat.id}
                                            layout
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                            className="card p-4 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${colorMap[cat.color] || 'bg-gray-500'}`} />
                                                <div>
                                                    <h3 className="font-bold text-sm">{cat.name}</h3>
                                                    <p className="text-xs text-[var(--text-muted)] font-medium capitalize">{cat.type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
