"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, IndianRupee, Calendar, FileText } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function RepaymentModal() {
    const { activeModal, modalData, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        note: ""
    });

    const lendingEntry = modalData?.lendingEntry;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lendingEntry || !form.amount) return;

        const val = parseFloat(form.amount);
        if (val <= 0 || val > lendingEntry.remaining_amount) return;

        setLoading(true);
        try {
            storage.addRepayment({
                lending_id: lendingEntry.id,
                amount: val,
                date: form.date,
                note: form.note || "Repayment"
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({ amount: "", date: new Date().toISOString().split('T')[0], note: "" });
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-repayment" || !lendingEntry) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card w-full max-w-md bg-[var(--card-color)] shadow-2xl overflow-hidden relative"
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <div>
                        <h2 className="text-xl font-bold">Record Payment</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {lendingEntry.type === 'lent' ? 'From' : 'To'} {lendingEntry.person_name} · Max ₹{lendingEntry.remaining_amount.toLocaleString()}
                        </p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Amount (₹)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={lendingEntry.remaining_amount}
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-11 pr-4 focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                required
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-11 pr-4 focus:border-blue-500 focus:outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Note (Optional)</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3 w-4 h-4 text-[var(--text-muted)]" />
                            <textarea
                                placeholder="Add a note..."
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                className="w-full min-h-[70px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-11 pr-4 py-2.5 focus:border-blue-500 focus:outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Progress preview */}
                    <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-[var(--text-muted)]">After this payment</span>
                            <span className="font-bold">
                                ₹{Math.max(0, lendingEntry.remaining_amount - (parseFloat(form.amount) || 0)).toLocaleString()} remaining
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--card-color)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{
                                    width: `${Math.min(100, ((lendingEntry.original_amount - lendingEntry.remaining_amount + (parseFloat(form.amount) || 0)) / lendingEntry.original_amount) * 100)}%`
                                }}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
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
                                "Record Payment"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
