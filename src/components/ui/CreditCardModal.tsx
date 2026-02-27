"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, CreditCard as CardIcon } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function CreditCardModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        name: "",
        limit: "",
        billing_cycle_start: "1",
        due_date: "15",
        notes: ""
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.limit) return;

        setLoading(true);
        try {
            storage.addCreditCard({
                name: form.name,
                limit: parseFloat(form.limit),
                billing_cycle_start: parseInt(form.billing_cycle_start),
                due_date: parseInt(form.due_date),
                notes: form.notes
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({ name: "", limit: "", billing_cycle_start: "1", due_date: "15", notes: "" });
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-credit-card") return null;

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
                        <CardIcon className="w-5 h-5 text-blue-500" />
                        Add Credit Card
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Card Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Amazon ICICI, HDFC Regalia..."
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Credit Limit (₹)</label>
                        <input
                            required
                            type="number"
                            placeholder="50000"
                            value={form.limit}
                            onChange={(e) => setForm({ ...form, limit: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Billing Start Day</label>
                            <input
                                required
                                type="number"
                                min="1"
                                max="31"
                                value={form.billing_cycle_start}
                                onChange={(e) => setForm({ ...form, billing_cycle_start: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Payment Due Day</label>
                            <input
                                required
                                type="number"
                                min="1"
                                max="31"
                                value={form.due_date}
                                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Notes (Optional)</label>
                        <textarea
                            placeholder="Any special perks or notes..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 focus:border-blue-500 focus:outline-none min-h-[80px]"
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
                                "Save Card"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
