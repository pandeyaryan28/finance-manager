"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Transaction } from "@/lib/storage";

export default function TransactionsPage() {
    const { openModal } = useModal();
    const [searchTerm, setSearchTerm] = useState("");
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = () => {
        try {
            const regularTxs = storage.getTransactions().map(tx => ({ ...tx, origin: 'liquid' }));
            const creditSpends = storage.getCreditSpends().map(s => ({
                ...s,
                type: 'expense' as const,
                origin: 'credit',
                account: { name: (s as any).card?.name || 'Credit Card' }
            }));
            const creditRepays = storage.getCreditRepayments().map(r => ({
                ...r,
                type: 'payment' as any,
                origin: 'repayment',
                title: `Payment to ${(r as any).card?.name}`,
                category: { name: 'Repayment' },
                account: { name: (r as any).account?.name || 'Bank' }
            }));

            const combined = [...regularTxs, ...creditSpends, ...creditRepays].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setAllTransactions(combined);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        try {
            storage.deleteTransaction(id);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTransactions = allTransactions.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-[var(--text-muted)]">Offline first (Data stays on your device).</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 w-full sm:w-64 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] hover:bg-[var(--bg-color)] transition-colors shadow-sm text-[var(--text-muted)] hover:text-[var(--text-color)]">
                        <Filter className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => openModal("add-expense")}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-md shadow-red-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Expense</span>
                    </button>
                    <button
                        onClick={() => openModal("add-income")}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Income</span>
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden text-sm">
                <div className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 p-4 border-b border-[var(--border-color)] font-medium text-[var(--text-muted)] bg-[var(--bg-color)]/50">
                    <div>Transaction</div>
                    <div>Category</div>
                    <div>Account</div>
                    <div className="text-right">Amount</div>
                    <div className="text-center">Actions</div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500" />
                        <span>Loading...</span>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-16 text-center text-[var(--text-muted)] flex flex-col items-center justify-center gap-4">
                        <Search className="w-12 h-12 opacity-10" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-color)]">
                        {filteredTransactions.map((tx, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                key={tx.id}
                                className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 p-4 items-center hover:bg-[var(--bg-color)] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${tx.origin === 'repayment' ? 'bg-blue-500/10 text-blue-500' : tx.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'} ${tx.is_pending ? 'opacity-50 grayscale' : ''}`}>
                                        {tx.origin === 'repayment' ? <ArrowUpRight className="w-5 h-5" /> : tx.type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold group-hover:text-blue-500 transition-colors">{tx.title}</div>
                                            {tx.origin === 'credit' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold uppercase">Credit</span>}
                                            {tx.origin === 'repayment' && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold uppercase">Payment</span>}
                                            {tx.is_pending && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold uppercase">Pending</span>}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)]">{new Date(tx.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-[var(--text-muted)] flex items-center">
                                    <span className="px-2 py-1 rounded-md bg-[var(--bg-color)] text-xs font-medium border border-[var(--border-color)] truncate max-w-full">
                                        {tx.category?.name || 'Uncategorized'}
                                    </span>
                                </div>
                                <div className="text-[var(--text-muted)]">
                                    {tx.account?.name || 'Wallet'}
                                </div>
                                <div className={`text-right font-bold text-base ${tx.origin === 'repayment' ? 'text-blue-500' : tx.type === 'expense' ? '' : 'text-emerald-500'}`}>
                                    {tx.type === 'expense' || tx.origin === 'repayment' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                                </div>
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => handleDelete(tx.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
