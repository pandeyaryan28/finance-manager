"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, IndianRupee, Calendar, FileText } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function LoanPaymentModal() {
    const { activeModal, closeModal, modalData } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        note: ""
    });

    const loan = modalData?.loan;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan || !form.amount) return;

        const amount = parseFloat(form.amount);
        if (amount <= 0 || amount > loan.remaining_amount) return;

        setLoading(true);
        try {
            storage.addLoanPayment({
                loan_id: loan.id,
                amount,
                date: form.date,
                note: form.note || undefined
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

    if (activeModal !== "add-loan-payment" || !loan) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="card w-full max-w-md bg-[var(--card-color)] shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <div>
                        <h2 className="text-xl font-bold">Record EMI Payment</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{loan.name} · {loan.lender}</p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Remaining info */}
                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Remaining</span>
                        <span className="font-bold text-blue-500">₹{loan.remaining_amount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Amount (₹)</label>
                        <input required type="number" placeholder={loan.emi_amount?.toString() || "0"} min="1" max={loan.remaining_amount}
                            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Date</label>
                        <input required type="date" value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Note (Optional)</label>
                        <input type="text" placeholder="e.g. March EMI"
                            value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={closeModal}
                            className="flex-1 h-11 rounded-xl border border-[var(--border-color)] font-medium hover:bg-[var(--bg-color)] transition-colors">
                            Cancel
                        </button>
                        <button disabled={loading || success} type="submit"
                            className="flex-[2] h-11 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
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
