"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CreditCard as CardIcon, Calendar, ArrowRight, ShieldCheck, AlertCircle, IndianRupee, History } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, CreditCard, Transaction } from "@/lib/storage";

export default function CreditCardsPage() {
    const { openModal } = useModal();
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            try {
                const fetchedCards = storage.getCreditCards();
                const fetchedTxs = storage.getTransactions();
                setCards(fetchedCards);
                setTransactions(fetchedTxs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRemainingDays = (dueDate: number) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let due = new Date(currentYear, currentMonth, dueDate);

        if (due < now) {
            due = new Date(currentYear, currentMonth + 1, dueDate);
        }

        const diffTime = Math.abs(due.getTime() - now.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 } as any
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 25 } as any
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
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credit Cards</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage cycles, dues and credit utilization.</p>
                </div>
                <button
                    onClick={() => openModal("add-credit-card")}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Card</span>
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="h-[400px] card flex flex-col items-center justify-center text-center p-8 border-dashed border-2">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                        <CardIcon className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Credit Cards Found</h3>
                    <p className="text-[var(--text-muted)] max-w-sm mb-8">
                        Add your first credit card to start tracking billing cycles and payment deadlines.
                    </p>
                    <button
                        onClick={() => openModal("add-credit-card")}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border border-[var(--border-color)] rounded-xl text-sm font-bold hover:bg-[var(--bg-color)] transition-all"
                    >
                        Create My First Card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {cards.map((card) => {
                        const utilization = (card.current_balance / card.limit) * 100;
                        const daysLeft = getRemainingDays(card.due_date);
                        const isCritical = utilization > 90 || daysLeft <= 5;
                        const isWarning = utilization > 70 || daysLeft <= 10;

                        return (
                            <motion.div
                                key={card.id}
                                variants={cardVariants}
                                className="group relative"
                            >
                                {/* Main Visual Card */}
                                <div className={`relative z-10 p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black text-white shadow-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-blue-500/10`}>

                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-700" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10 group-hover:bg-purple-500/20 transition-all duration-700" />

                                    <div className="relative flex flex-col h-full justify-between">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Clarity Credit</span>
                                                    {isCritical ? (
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase">Critical</div>
                                                    ) : isWarning ? (
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase">Warning</div>
                                                    ) : null}
                                                </div>
                                                <h2 className="text-2xl font-bold tracking-tight">{card.name}</h2>
                                            </div>
                                            <div className="w-12 h-8 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden">
                                                <div className="w-8 h-8 rotate-45 bg-gradient-to-br from-blue-400/30 to-purple-400/30" />
                                            </div>
                                        </div>

                                        <div className="mt-10 mb-8">
                                            <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-widest mb-1 opacity-60">Current Outstanding</div>
                                            <div className="text-5xl font-bold flex items-center">
                                                <span className="text-2xl font-normal opacity-50 mr-2">₹</span>
                                                {card.current_balance.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between items-end mb-2 text-xs">
                                                    <span className="font-bold uppercase tracking-wider opacity-60">Limit Used: {utilization.toFixed(1)}%</span>
                                                    <span className="font-medium opacity-80">Limit: ₹{card.limit.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${utilization}%` }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                        className={`h-full rounded-full ${utilization > 90 ? "bg-red-500" :
                                                            utilization > 70 ? "bg-amber-500" :
                                                                "bg-gradient-to-r from-blue-400 to-indigo-500"
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${daysLeft <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/60'}`}>
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Due In</div>
                                                        <div className={`text-sm font-bold ${daysLeft <= 5 ? 'text-red-400' : ''}`}>{daysLeft} Days</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-white/5 text-white/60">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Available</div>
                                                        <div className="text-sm font-bold text-emerald-400">₹{(card.limit - card.current_balance).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Bar (Slides out or appears below) */}
                                <div className="mt-4 flex gap-3 px-2">
                                    <button
                                        onClick={() => openModal("add-transaction")} // We'll update the modal to support card selection
                                        className="flex-1 h-12 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] text-sm font-bold hover:bg-blue-500/10 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Plus className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                        Record Spend
                                    </button>
                                    <button
                                        className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        Pay Overdue
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Statement History Placeholder */}
            {cards.length > 0 && (
                <motion.div
                    variants={cardVariants}
                    className="card p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <History className="w-5 h-5 text-purple-500" />
                                Statement History
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1">Review past billing cycles and recorded payments.</p>
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border-color)]">
                        {cards.map(card => {
                            const cardTxs = transactions.filter(tx => tx.credit_card_id === card.id);
                            return (
                                <div key={card.id} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-color)] flex items-center justify-center">
                                                <CardIcon className="w-5 h-5 text-[var(--text-muted)]" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{card.name}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{cardTxs.length} transactions in current cycle</div>
                                            </div>
                                        </div>
                                        <button className="text-sm font-bold text-blue-500 hover:text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-500/5 transition-all">
                                            View Statement
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
