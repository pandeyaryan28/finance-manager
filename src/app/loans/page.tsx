"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Landmark, Calendar, Trash2, History, IndianRupee,
    CheckCircle2, Clock, AlertTriangle, ChevronRight, Percent
} from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Loan, LoanPayment } from "@/lib/storage";

export default function LoansPage() {
    const { openModal } = useModal();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const fetchData = () => {
        try {
            setLoans(storage.getLoans());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? All payment history will be removed.`)) return;
        storage.deleteLoan(id);
        fetchData();
    };

    const handleRecordPayment = (loan: Loan) => {
        openModal("add-loan-payment", { loan });
    };

    const getNextEmiDate = (emiDay: number) => {
        const now = new Date();
        let next = new Date(now.getFullYear(), now.getMonth(), emiDay);
        if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, emiDay);
        const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { date: next, daysLeft: diff };
    };

    const filteredLoans = loans.filter(l => {
        if (filter === 'active') return l.status === 'active';
        if (filter === 'completed') return l.status === 'completed';
        return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalRemaining = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.remaining_amount, 0);
    const totalEmi = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.emi_amount, 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } as any }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } as any }
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500" />
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loans & EMIs</h1>
                    <p className="text-[var(--text-muted)] mt-1">Track formal loans, EMI schedules, and payment history.</p>
                </div>
                <button
                    onClick={() => openModal("add-loan")}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Loan</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-blue-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Outstanding</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold">₹{totalRemaining.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">{loans.filter(l => l.status === 'active').length} active loans</div>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-amber-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Monthly EMI</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-amber-500">₹{totalEmi.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Total per month</div>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Completed</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-emerald-500">{loans.filter(l => l.status === 'completed').length}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Loans fully paid</div>
                    </div>
                </motion.div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 p-1 bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl w-fit">
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${filter === f ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-color)]"}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Loans List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredLoans.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-40 flex flex-col items-center justify-center text-[var(--text-muted)] card border-dashed">
                            <Landmark className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm font-medium">No loans found.</p>
                        </motion.div>
                    ) : (
                        filteredLoans.map((loan) => {
                            const progress = ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100;
                            const nextEmi = getNextEmiDate(loan.emi_date);
                            const isUrgent = nextEmi.daysLeft <= 5 && loan.status === 'active';
                            const payments = storage.getLoanPayments(loan.id);

                            return (
                                <motion.div key={loan.id} layout variants={itemVariants} className="group">
                                    <div className={`card overflow-hidden transition-all ${loan.status === 'completed' ? "opacity-60 grayscale" : ""}`}>
                                        {/* Main Row */}
                                        <div onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUrgent ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"} transition-transform group-hover:scale-110`}>
                                                    <Landmark className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-lg">{loan.name}</h3>
                                                        {loan.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                        {isUrgent && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-bold text-red-400 uppercase">
                                                                <AlertTriangle className="w-3 h-3" /> EMI Due
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-medium mt-0.5">
                                                        <span>{loan.lender}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> EMI on {loan.emi_date}{['st', 'nd', 'rd'][loan.emi_date - 1] || 'th'} of each month
                                                        </span>
                                                        {loan.interest_rate && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-0.5">
                                                                    <Percent className="w-3 h-3" /> {loan.interest_rate}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold tabular-nums">₹{loan.remaining_amount.toLocaleString()}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                        {loan.status === 'completed' ? "Fully Paid" : `of ₹${loan.total_amount.toLocaleString()}`}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(loan.id, loan.name); }}
                                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="px-5 pb-4">
                                            <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                                                <span>{progress.toFixed(0)}% paid</span>
                                                <span>EMI: ₹{loan.emi_amount.toLocaleString()}/mo</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Section */}
                                        <AnimatePresence>
                                            {expandedId === loan.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-[var(--border-color)] bg-[var(--bg-color)]/30"
                                                >
                                                    <div className="p-6">
                                                        <div className="flex flex-col md:flex-row gap-8">
                                                            {/* Payment History */}
                                                            <div className="flex-1 space-y-4">
                                                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
                                                                    <History className="w-3.5 h-3.5" /> Payment History
                                                                </h4>
                                                                <div className="space-y-3 pl-3 border-l border-[var(--border-color)]">
                                                                    {payments.map((p) => (
                                                                        <div key={p.id} className="relative flex items-center justify-between py-1">
                                                                            <div className="absolute -left-[13px] w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                            <div>
                                                                                <span className="text-sm font-bold">₹{p.amount.toLocaleString()}</span>
                                                                                <span className="text-[10px] text-[var(--text-muted)] ml-2">{new Date(p.date).toLocaleDateString()}</span>
                                                                            </div>
                                                                            {p.note && <span className="text-[10px] text-[var(--text-muted)] italic">{p.note}</span>}
                                                                        </div>
                                                                    ))}
                                                                    {payments.length === 0 && (
                                                                        <p className="text-xs italic text-[var(--text-muted)] py-2">No payments recorded yet.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action Column */}
                                                            <div className="w-full md:w-64 space-y-4">
                                                                {/* Next EMI */}
                                                                {loan.status === 'active' && (
                                                                    <div className={`p-4 rounded-2xl border ${isUrgent ? "bg-red-500/5 border-red-500/20" : "bg-[var(--card-color)] border-[var(--border-color)]"}`}>
                                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Next EMI</h4>
                                                                        <div className={`text-lg font-bold ${isUrgent ? "text-red-400" : ""}`}>
                                                                            {nextEmi.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </div>
                                                                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                                                                            {nextEmi.daysLeft} days away · ₹{loan.emi_amount.toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {loan.status === 'active' && (
                                                                    <button
                                                                        onClick={() => handleRecordPayment(loan)}
                                                                        className="w-full h-11 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                        Record EMI Payment
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
