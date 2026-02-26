"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, AlertTriangle, IndianRupee, Utensils, ShoppingBag, Car, Zap, Heart, Activity } from "lucide-react";
import { useModal } from "@/lib/ModalContext";

export default function BudgetsPage() {
    const { openModal } = useModal();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/budgets/?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
                const data = await res.json();
                setBudgets(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    const totalSpent = 0; // In a real app, we'd fetch transactions for the month too
    const totalLimit = budgets.reduce((acc, curr: any) => acc + curr.amount, 0);
    const overallPercentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
                    <p className="text-[var(--text-muted)]">Track your spending limits for this month.</p>
                </div>
                <button
                    onClick={() => alert("Add Budget functionality implemented in API, UI form coming soon! Use 'Add Transaction' to see live data.")}
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
                            <div className="w-full bg-[var(--bg-color)] rounded-full h-3 overflow-hidden border border-[var(--border-color)] shadow-inner">
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

                {budgets.length === 0 ? (
                    <div className="col-span-1 md:col-span-3 card p-12 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-[var(--bg-color)] rounded-2xl flex items-center justify-center text-[var(--text-muted)]">
                            <Activity className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-[var(--text-muted)]">No active budgets. Add your first budget to start tracking.</p>
                    </div>
                ) : (
                    budgets.map((budget: any, i) => {
                        const percentage = 0; // Ideally fetch spent per category
                        return (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`card p-5 group flex flex-col justify-between hover:shadow-lg transition-all border border-[var(--border-color)]`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                                            <Target className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{budget.category?.name}</h3>
                                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">Monthly Goal</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-end justify-between">
                                        <div className="text-2xl font-bold tracking-tight">
                                            <span className="text-[var(--text-muted)] text-sm mr-1">₹</span>
                                            {budget.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] font-medium italic">Active for this month</p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
