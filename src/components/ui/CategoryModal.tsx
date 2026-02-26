"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function CategoryModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        name: "",
        type: "expense" as 'income' | 'expense',
        icon: "activity",
        color: "blue"
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;

        setLoading(true);
        try {
            storage.addCategory(form);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({ name: "", type: "expense", icon: "activity", color: "blue" });
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-category") return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-md bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">Add Category</h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="flex p-1 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: "expense" })}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${form.type === "expense" ? "bg-white dark:bg-slate-800 shadow-sm text-red-500" : "text-[var(--text-muted)]"
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Category Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Subscriptions, Groceries..."
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Color</label>
                            <select
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="blue">Blue</option>
                                <option value="emerald">Emerald</option>
                                <option value="red">Red</option>
                                <option value="purple">Purple</option>
                                <option value="amber">Amber</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Icon</label>
                            <select
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="activity">Activity</option>
                                <option value="utensils">Utensils</option>
                                <option value="shopping-bag">Shopping Bag</option>
                                <option value="home">Home</option>
                                <option value="car">Car</option>
                                <option value="zap">Zap</option>
                                <option value="heart">Heart</option>
                            </select>
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
                                "Save Category"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
