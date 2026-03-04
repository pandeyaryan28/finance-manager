"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    HandCoins,
    History,
    ChevronDown,
    ChevronUp,
    ArrowUpCircle,
    ArrowDownCircle,
    User,
    Calendar,
    IndianRupee,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Lending, Repayment } from "@/lib/storage";

export default function LendingPage() {
    const { openModal } = useModal();
    const [entries, setEntries] = useState<Lending[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'repaid'>('all');

    useEffect(() => {
        const fetchData = () => {
            try {
                const fetched = storage.getLendingEntries();
                setEntries(fetched);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredEntries = entries.filter(e => {
        if (filter === 'active') return e.status !== 'fully_repaid';
        if (filter === 'repaid') return e.status === 'fully_repaid';
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = entries.reduce((acc, curr) => {
        if (curr.type === 'lent') {
            acc.lentTotal += curr.original_amount;
            acc.lentPending += curr.remaining_amount;
        } else {
            acc.borrowedTotal += curr.original_amount;
            acc.borrowedPending += curr.remaining_amount;
        }
        return acc;
    }, { lentTotal: 0, lentPending: 0, borrowedTotal: 0, borrowedPending: 0 });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 } as any
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 350, damping: 25 } as any
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500" />
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-6xl mx-auto"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lending & Debts</h1>
                    <p className="text-[var(--text-muted)] mt-1">Track interpersonal loans and repayments.</p>
                </div>
                <button
                    onClick={() => openModal("add-lending")}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Entry</span>
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-blue-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">You Lent</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold">₹{stats.lentPending.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">Pending from ₹{stats.lentTotal.toLocaleString()} total</div>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-purple-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">You Borrowed</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold">₹{stats.borrowedPending.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">Remaining from ₹{stats.borrowedTotal.toLocaleString()} total</div>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Net Position</span>
                    <div className="mt-4">
                        <div className={`text-2xl font-bold ${stats.lentPending - stats.borrowedPending >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {stats.lentPending - stats.borrowedPending >= 0 ? "+" : "-"}₹{Math.abs(stats.lentPending - stats.borrowedPending).toLocaleString()}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium uppercase tracking-tighter">Current liquidity impact</div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 p-1 bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl w-fit">
                {(['all', 'active', 'repaid'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${filter === f ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Entries List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-40 flex flex-col items-center justify-center text-[var(--text-muted)] card border-dashed"
                        >
                            <Clock className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm font-medium">No lending records found for current filter.</p>
                        </motion.div>
                    ) : (
                        filteredEntries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                layout
                                variants={itemVariants}
                                className="group"
                            >
                                <div className={`card overflow-hidden border-l-4 transition-all ${entry.status === 'fully_repaid' ? "opacity-60 grayscale border-l-slate-400" :
                                    entry.type === 'lent' ? "border-l-blue-500" : "border-l-purple-500"
                                    }`}>
                                    <div
                                        onClick={() => toggleExpand(entry.id)}
                                        className="p-5 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${entry.type === 'lent' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                                                }`}>
                                                {entry.type === 'lent' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg">{entry.person_name}</h3>
                                                    {entry.status === 'fully_repaid' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
                                                    <span className="flex items-center gap-1 uppercase tracking-tighter">
                                                        <Calendar className="w-3 h-3" /> {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="uppercase tracking-tighter">{entry.type === 'lent' ? "You Lent" : "You Borrowed"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xl font-bold tracking-tight">₹{entry.remaining_amount.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                                {entry.remaining_amount === 0 ? "Fully Repaid" : `Pending from ₹${entry.original_amount.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded History & Actions */}
                                    <AnimatePresence>
                                        {expandedIds.includes(entry.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[var(--border-color)] bg-[var(--bg-color)]/30 backdrop-blur-sm"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col md:flex-row gap-8">
                                                        <div className="flex-1 space-y-4">
                                                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
                                                                <History className="w-3.5 h-3.5" />
                                                                Repayment History
                                                            </h4>

                                                            <div className="space-y-4 pl-3 border-l border-[var(--border-color)]">
                                                                {storage.getRepaymentsForLending(entry.id).map((r, idx) => (
                                                                    <div key={r.id} className="relative flex items-center justify-between py-1">
                                                                        <div className="absolute -left-[13px] w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold">₹{r.amount.toLocaleString()}</span>
                                                                            <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">{new Date(r.date).toLocaleDateString()}</span>
                                                                        </div>
                                                                        {r.note && <span className="text-[10px] text-[var(--text-muted)] italic font-medium">{r.note}</span>}
                                                                    </div>
                                                                ))}
                                                                {storage.getRepaymentsForLending(entry.id).length === 0 && (
                                                                    <p className="text-xs italic text-[var(--text-muted)] py-2">No repayments recorded yet.</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:w-64 space-y-4">
                                                            <div className="p-4 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-sm">
                                                                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Quick Summary</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-[var(--text-muted)]">Progress</span>
                                                                        <span className="font-bold">{Math.round(((entry.original_amount - entry.remaining_amount) / entry.original_amount) * 100)}%</span>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-[var(--bg-color)] rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-blue-500"
                                                                            style={{ width: `${((entry.original_amount - entry.remaining_amount) / entry.original_amount) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {entry.status !== 'fully_repaid' && (
                                                                <button
                                                                    onClick={() => openModal("add-repayment", { lendingEntry: entry })}
                                                                    className="w-full h-11 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    Record Payment
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
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
