"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, HandCoins, User } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function LendingModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        person_name: "",
        type: "lent" as 'lent' | 'borrowed',
        original_amount: "",
        date: new Date().toISOString().split('T')[0],
        repayment_date: "",
        notes: ""
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.person_name || !form.original_amount) return;

        setLoading(true);
        try {
            storage.addLendingEntry({
                person_name: form.person_name,
                type: form.type,
                original_amount: parseFloat(form.original_amount),
                date: form.date,
                repayment_date: form.repayment_date || undefined,
                notes: form.notes
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({
                    person_name: "",
                    type: "lent",
                    original_amount: "",
                    date: new Date().toISOString().split('T')[0],
                    repayment_date: "",
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

    if (activeModal !== "add-lending") return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-md bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <HandCoins className="w-5 h-5 text-blue-500" />
                        New Lending Entry
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="flex p-1 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: "lent" })}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.type === "lent" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-500" : "text-[var(--text-muted)]"}`}
                        >
                            You Lent
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: "borrowed" })}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${form.type === "borrowed" ? "bg-white dark:bg-slate-800 shadow-sm text-purple-500" : "text-[var(--text-muted)]"}`}
                        >
                            You Borrowed
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Person / Entity</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                required
                                type="text"
                                placeholder="Who is involved?"
                                value={form.person_name}
                                onChange={(e) => setForm({ ...form, person_name: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-11 pr-4 focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Amount (₹)</label>
                        <input
                            required
                            type="number"
                            placeholder="0.00"
                            value={form.original_amount}
                            onChange={(e) => setForm({ ...form, original_amount: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Date</label>
                            <input
                                required
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Expect By (Optional)</label>
                            <input
                                type="date"
                                value={form.repayment_date}
                                onChange={(e) => setForm({ ...form, repayment_date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Notes</label>
                        <textarea
                            placeholder="Add some details..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full min-h-[80px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 focus:border-blue-500 focus:outline-none transition-all text-sm"
                        />
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
                                "Record Transaction"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
