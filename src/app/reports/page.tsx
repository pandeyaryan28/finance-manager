"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Filter, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { downloadCSV } from "@/lib/csvUtils";

export default function ReportsPage() {
    const [data, setData] = useState<{ month: string, income: number, expense: number }[]>([]);
    const [categories, setCategories] = useState<{ name: string, amount: number, percentage: number, color: string }[]>([]);
    const [rawTransactions, setRawTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/transactions/");
                const txs = await res.json();
                setRawTransactions(txs);

                // Process monthly data (just showing dummy month for now matched to real totals)
                let totalIncome = 0;
                let totalExpense = 0;
                const catMap: Record<string, { amount: number, color: string }> = {};

                txs.forEach((t: any) => {
                    if (t.type === 'income') totalIncome += t.amount;
                    else {
                        totalExpense += t.amount;
                        const catName = t.category?.name || "Other";
                        if (!catMap[catName]) catMap[catName] = { amount: 0, color: t.category?.color || "blue" };
                        catMap[catName].amount += t.amount;
                    }
                });

                setData([
                    { month: "Live Data", income: totalIncome, expense: totalExpense }
                ]);

                const processedCats = Object.entries(catMap).map(([name, info]) => ({
                    name,
                    amount: info.amount,
                    percentage: totalExpense > 0 ? (info.amount / totalExpense) * 100 : 0,
                    color: info.color
                })).sort((a, b) => b.amount - a.amount);

                setCategories(processedCats);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExport = () => {
        if (rawTransactions.length === 0) return;
        const exportData = rawTransactions.map((t: any) => ({
            Date: t.date,
            Title: t.title,
            Type: t.type,
            Category: t.category?.name,
            Amount: t.amount,
            Account: t.account?.name
        }));
        downloadCSV(exportData, "Clarity_Finance_Report");
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                    <p className="text-[var(--text-muted)]">Analyze your cash flow and financial trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 text-sm font-medium hover:bg-[var(--bg-color)] transition-colors shadow-sm">
                        <Filter className="h-4 w-4" />
                        <span>Last 6 Months</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-3 card p-6 lg:p-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 className="text-xl font-bold tracking-tight flex items-center">
                            <BarChart3 className="mr-2 text-blue-500 w-6 h-6" />
                            Live Cash Flow summary
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[var(--text-muted)] text-sm mb-1">Total Income</div>
                                <div className="font-bold flex items-center justify-end text-emerald-500 text-lg">
                                    <ArrowUpRight className="w-4 h-4 mr-1" /> ₹{data[0]?.income.toLocaleString() || 0}
                                </div>
                            </div>
                            <div className="w-px h-10 bg-[var(--border-color)]"></div>
                            <div className="text-right">
                                <div className="text-[var(--text-muted)] text-sm mb-1">Total Expense</div>
                                <div className="font-bold flex items-center justify-end text-red-500 text-lg">
                                    <ArrowDownRight className="w-4 h-4 mr-1" /> ₹{data[0]?.expense.toLocaleString() || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-color)', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: 'var(--text-color)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-1 card p-6 border-[var(--border-color)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold tracking-tight italic">Top Categories (Expenses)</h2>
                    </div>

                    <div className="space-y-5">
                        {categories.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] p-4 text-center">No expense data to analyze yet.</p>
                        ) : (
                            categories.map((cat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{cat.name}</span>
                                        <span className="font-semibold text-[var(--text-muted)]">₹{cat.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-[var(--bg-color)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                                            className={`h-full rounded-full 
                        ${cat.color === 'blue' ? 'bg-blue-500' : ''}
                        ${cat.color === 'emerald' ? 'bg-emerald-500' : ''}
                        ${cat.color === 'purple' ? 'bg-purple-500' : ''}
                        ${cat.color === 'amber' ? 'bg-amber-500' : ''}
                        ${cat.color === 'red' ? 'bg-red-500' : ''}
                      `}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 md:col-span-2 card p-6 border-[var(--border-color)] flex flex-col items-center justify-center text-center bg-gradient-to-br from-[var(--card-color)] to-[var(--bg-color)]"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                        <BarChart3 className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Detailed Monthly Breakdown</h3>
                    <p className="text-[var(--text-muted)] max-w-sm mb-6 text-sm">
                        You've exported your data. We'll soon add deep-dive analytics by week and vendor analysis.
                    </p>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl text-xs font-semibold">WEEKLY VIEW</div>
                        <div className="px-4 py-2 bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl text-xs font-semibold">VENDOR ANALYSIS</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
