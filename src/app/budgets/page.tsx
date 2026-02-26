"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Activity } from "lucide-react";
import { useModal } from "@/lib/ModalContext";

export default function BudgetsPage() {
    const { openModal } = useModal();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);

    const totalSpent = 0;
    const totalLimit = budgets.reduce((acc, curr: any) => acc + curr.amount, 0);
    const overallPercentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
                    <p className="text-[var(--text-muted)]">Track your spending limits (Local Storage).</p>
                </div>
                <button
                    onClick={() => alert("Budget creation coming soon to Local Storage version!")}
                    className="flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Budget</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-3 card p-6 bg-gradient-to-br from-[var(--card-color)] to-[var(--bg-color)] border border-[var(--border-color)] overflow-hidden relative"
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-[var(--text-muted)]">
                                <Target className="w-4 h-4 mr-2" />
                                Overall Monthly Budget
                            </div>
                            <div className="text-4xl font-bold tracking-tight">
                                <span className="text-[var(--text-muted)] text-2xl">₹</span>{totalSpent.toLocaleString()}{" "}
                                <span className="text-lg text-[var(--text-muted)] font-normal">/ ₹{totalLimit.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md w-full">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium">{overallPercentage}% Used</span>
                                <span className="text-sm text-[var(--text-muted)]">₹{(totalLimit - totalSpent).toLocaleString()} remaining</span>
                            </div>
                            <div className="w-full bg-[var(--bg-color)] rounded-full h-3 overflow-hidden border border-[var(--border-color)]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallPercentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500`}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="col-span-1 md:col-span-3 card p-12 text-center flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-[var(--text-muted)] opacity-20" />
                    <p className="text-[var(--text-muted)]">No active budgets. Add your first budget to start tracking.</p>
                </div>
            </div>
        </div>
    );
}
