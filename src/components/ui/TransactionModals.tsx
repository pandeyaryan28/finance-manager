"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, IndianRupee, Calendar, Tag, Wallet } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Category, Account } from "@/lib/storage";

export function TransactionModals() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [form, setForm] = useState({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category_id: "",
        account_id: "",
        notes: ""
    });

    useEffect(() => {
        if (activeModal === "add-income" || activeModal === "add-expense") {
            const allCats = storage.getCategories();
            const type = activeModal === "add-income" ? "income" : "expense";
            setCategories(allCats.filter(c => c.type === type));
            setAccounts(storage.getAccounts());
        }
    }, [activeModal]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.amount || !form.category_id || !form.account_id) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const txData = {
                title: form.title,
                amount: parseFloat(form.amount),
                date: form.date,
                category_id: form.category_id,
                account_id: form.account_id,
                notes: form.notes,
                is_pending: false
            };

            if (activeModal === "add-income") {
                storage.addIncome(txData);
            } else {
                storage.addExpense(txData);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({
                    title: "",
                    amount: "",
                    date: new Date().toISOString().split('T')[0],
                    category_id: "",
                    account_id: "",
                    notes: ""
                });
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-income" && activeModal !== "add-expense") return null;

    const modalTitle = activeModal === "add-income" ? "Add Income" : "Add Expense";
    const accentColor = activeModal === "add-income" ? "emerald" : "red";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-lg bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className={`p-6 border-b border-[var(--border-color)] flex items-center justify-between`}>
                    <div>
                        <h2 className="text-xl font-bold">{modalTitle}</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest text-${accentColor}-500 mt-1`}>Liquid Transaction</p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="Salary, Rent, Dinner..."
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Category</label>
                        <div className="relative">
                            <Tag className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                            <select
                                required
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Account</label>
                        <div className="relative">
                            <Wallet className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                            <select
                                required
                                value={form.account_id}
                                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="">Select Account</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] font-bold text-sm hover:bg-[var(--bg-color)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || success}
                            type="submit"
                            className={`flex-[2] h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                            ) : success ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                "Record Transaction"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export function CreditSpendModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [form, setForm] = useState({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category_id: "",
        card_id: "",
        notes: ""
    });

    useEffect(() => {
        if (activeModal === "add-credit-spend") {
            const allCats = storage.getCategories();
            setCategories(allCats.filter(c => c.type === "expense"));
            setCards(storage.getCreditCards());
        }
    }, [activeModal]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.amount || !form.category_id || !form.card_id) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            storage.addCreditSpend({
                title: form.title,
                amount: parseFloat(form.amount),
                date: form.date,
                category_id: form.category_id,
                card_id: form.card_id,
                notes: form.notes
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-credit-spend") return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-lg bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Record Card Spend</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mt-1">Credit Card Debt</p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="Amazon, Netflix, Dining out..."
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Amount (₹)</label>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Category</label>
                        <select
                            required
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none appearance-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Source Credit Card</label>
                        <select
                            required
                            value={form.card_id}
                            onChange={(e) => setForm({ ...form, card_id: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none appearance-none"
                        >
                            <option value="">Select Card</option>
                            {cards.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] font-bold text-sm hover:bg-[var(--bg-color)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || success}
                            type="submit"
                            className="flex-[2] h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                            ) : success ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                "Record Spend"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
