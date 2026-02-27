"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, CreditCard as CardIcon } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Category, Account, CreditCard } from "@/lib/storage";

export function TransactionModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

    const [form, setForm] = useState({
        title: "",
        amount: "",
        type: "expense" as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0],
        category_id: "",
        account_id: "",
        credit_card_id: "",
        notes: "",
        is_pending: false,
        is_credit_card: false
    });

    useEffect(() => {
        if (activeModal === "add-transaction") {
            setCategories(storage.getCategories());
            setAccounts(storage.getAccounts());
            setCreditCards(storage.getCreditCards());
        }
    }, [activeModal]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Account is needed if not credit card, else credit card is needed
        if (!form.title || !form.amount || !form.category_id) return;
        if (!form.is_credit_card && !form.account_id) return;
        if (form.is_credit_card && !form.credit_card_id) return;

        setLoading(true);
        try {
            storage.addTransaction({
                title: form.title,
                amount: parseFloat(form.amount),
                type: form.type,
                date: form.date,
                category_id: form.category_id,
                account_id: form.is_credit_card ? "" : form.account_id,
                credit_card_id: form.is_credit_card ? form.credit_card_id : undefined,
                notes: form.notes,
                is_pending: form.is_pending
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({
                    title: "",
                    amount: "",
                    type: "expense",
                    date: new Date().toISOString().split('T')[0],
                    category_id: "",
                    account_id: "",
                    credit_card_id: "",
                    notes: "",
                    is_pending: false,
                    is_credit_card: false
                });
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-transaction") return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-lg bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">Add Transaction</h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="flex p-1 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: "expense" })}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.type === "expense" ? "bg-white dark:bg-slate-800 shadow-sm text-red-500" : "text-[var(--text-muted)]"
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: "income" })}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${form.type === "income" ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-500" : "text-[var(--text-muted)]"
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Title</label>
                            <input
                                required
                                type="text"
                                placeholder="Rent, Groceries, Salary..."
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Amount (₹)</label>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5 col-span-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-[var(--text-muted)]">Category</label>
                            </div>
                            <select
                                required
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.filter(c => c.type === form.type).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2 space-y-3">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!form.is_credit_card}
                                        onChange={() => setForm({ ...form, is_credit_card: false })}
                                        className="w-4 h-4 text-blue-600 border-[var(--border-color)]"
                                    />
                                    <span className="text-sm font-medium">Standard Account</span>
                                </label>
                                {creditCards.length > 0 && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={form.is_credit_card}
                                            onChange={() => setForm({ ...form, is_credit_card: true })}
                                            className="w-4 h-4 text-blue-600 border-[var(--border-color)]"
                                        />
                                        <span className="text-sm font-medium">Credit Card</span>
                                    </label>
                                )}
                            </div>

                            {!form.is_credit_card ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-muted)]">Paid Via</label>
                                    <select
                                        required={!form.is_credit_card}
                                        value={form.account_id}
                                        onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-muted)]">Source Card</label>
                                    <select
                                        required={form.is_credit_card}
                                        value={form.credit_card_id}
                                        onChange={(e) => setForm({ ...form, credit_card_id: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select Card</option>
                                        {creditCards.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)]/50">
                            <input
                                type="checkbox"
                                id="is_pending"
                                checked={form.is_pending}
                                onChange={(e) => setForm({ ...form, is_pending: e.target.checked })}
                                className="w-5 h-5 rounded border-[var(--border-color)] text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_pending" className="text-sm font-medium cursor-pointer">
                                Mark as Pending
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 h-11 rounded-xl border border-[var(--border-color)] font-medium hover:bg-[var(--bg-color)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || success}
                            type="submit"
                            className="flex-[2] h-11 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                            ) : success ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                "Save Transaction"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
