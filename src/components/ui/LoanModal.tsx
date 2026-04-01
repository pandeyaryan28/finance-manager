"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Landmark, IndianRupee, Calendar, FileText, Percent } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

export function LoanModal() {
    const { activeModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [addEmi, setAddEmi] = useState(true);
    const [form, setForm] = useState({
        name: "",
        lender: "",
        total_amount: "",
        emi_amount: "",
        emi_date: "1",
        interest_rate: "",
        start_date: new Date().toISOString().split('T')[0],
        notes: ""
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.lender || !form.total_amount) return;
        if (addEmi && !form.emi_amount) return;

        setLoading(true);
        try {
            storage.addLoan({
                name: form.name,
                lender: form.lender,
                total_amount: parseFloat(form.total_amount),
                emi_amount: addEmi ? parseFloat(form.emi_amount) : 0,
                emi_date: addEmi ? parseInt(form.emi_date) : 1,
                interest_rate: (addEmi && form.interest_rate) ? parseFloat(form.interest_rate) : undefined,
                start_date: form.start_date,
                notes: form.notes || undefined
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                setForm({ name: "", lender: "", total_amount: "", emi_amount: "", emi_date: "1", interest_rate: "", start_date: new Date().toISOString().split('T')[0], notes: "" });
                setAddEmi(true);
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-loan") return null;

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
                        <Landmark className="w-5 h-5 text-blue-500" />
                        Add Loan
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Loan Name</label>
                        <input required type="text" placeholder="e.g. Home Loan, Car EMI..."
                            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Lender / Bank</label>
                        <input required type="text" placeholder="e.g. SBI, HDFC, Bajaj Finance..."
                            value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Total Amount (₹)</label>
                            <input required type="number" placeholder="0" min="1"
                                value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-6 col-span-2 sm:col-span-1">
                            <input 
                                type="checkbox" 
                                id="addEmiToggle"
                                checked={addEmi} 
                                onChange={(e) => setAddEmi(e.target.checked)} 
                                className="w-4 h-4 rounded border-[var(--border-color)] text-blue-500 focus:ring-blue-500 bg-[var(--bg-color)]"
                            />
                            <label htmlFor="addEmiToggle" className="text-sm font-medium cursor-pointer">
                                Include EMI details
                            </label>
                        </div>
                    </div>

                    {addEmi && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--text-muted)]">EMI Amount (₹)</label>
                                <input required type="number" placeholder="0" min="1"
                                    value={form.emi_amount} onChange={(e) => setForm({ ...form, emi_amount: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-muted)]">EMI Due Date (Day)</label>
                                    <select
                                        value={form.emi_date} onChange={(e) => setForm({ ...form, emi_date: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 focus:border-blue-500 focus:outline-none"
                                    >
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-muted)]">Interest Rate (%)</label>
                                    <input type="number" step="0.01" placeholder="Optional"
                                        value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Start Date</label>
                        <input required type="date" value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-muted)]">Notes</label>
                        <textarea placeholder="Add details..." value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full min-h-[60px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 focus:border-blue-500 focus:outline-none transition-all text-sm"
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
                                "Add Loan"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
