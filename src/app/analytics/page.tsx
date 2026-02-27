"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    PieChart as PieChartIcon,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    IndianRupee,
    ChevronRight,
    Calendar,
    CreditCard
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { storage, Transaction, Category, Account } from "@/lib/storage";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [accountData, setAccountData] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
    });

    useEffect(() => {
        const fetchData = () => {
            try {
                const transactions = storage.getTransactions();
                const categories = storage.getCategories();
                const accounts = storage.getAccounts();
                const creditCards = storage.getCreditCards();
                const creditSpends = storage.getCreditSpends();

                let liquidIncome = 0;
                let liquidExpenses = 0;
                let totalCreditSpend = 0;

                // Category-wise Breakdown (Everything)
                const catMap: Record<string, number> = {};

                // Regular transactions
                transactions.forEach(t => {
                    if (t.is_pending) return;
                    if (t.type === 'expense') {
                        const cat = categories.find(c => c.id === t.category_id);
                        const catName = cat?.name || "Other";
                        catMap[catName] = (catMap[catName] || 0) + t.amount;
                        liquidExpenses += t.amount;
                    } else {
                        liquidIncome += t.amount;
                    }
                });

                // Credit Card Spends
                creditSpends.forEach(s => {
                    const cat = categories.find(c => c.id === s.category_id);
                    const catName = cat?.name || "Other";
                    catMap[catName] = (catMap[catName] || 0) + s.amount;
                    totalCreditSpend += s.amount;
                });

                const formattedCatData = Object.entries(catMap).map(([name, value]) => ({
                    name,
                    value
                })).sort((a, b) => b.value - a.value);

                // Account-wise Funds Breakdown
                const accData = accounts.map(acc => {
                    let balance = 0;
                    transactions.forEach(t => {
                        if (t.account_id === acc.id && !t.is_pending) {
                            if (t.type === 'income') balance += t.amount;
                            else balance -= t.amount;
                        }
                    });
                    return { name: acc.name, value: balance, type: 'liquid' };
                }).filter(a => Math.abs(a.value) > 0);

                // Add Credit Cards to Distribution
                const creditData = creditCards.map(card => ({
                    name: card.name,
                    value: -card.current_balance,
                    type: 'credit'
                })).filter(c => Math.abs(c.value) > 0);

                setCategoryData(formattedCatData);
                setAccountData([...accData, ...creditData]);
                setSummary({
                    totalIncome: liquidIncome,
                    totalExpenses: liquidExpenses + totalCreditSpend,
                    netBalance: liquidIncome - liquidExpenses,
                    creditDebt: creditCards.reduce((acc, c) => acc + c.current_balance, 0)
                } as any);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Financial Analytics</h1>
                    <p className="text-[var(--text-muted)]">Deep dive into your spending and fund distribution.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card-color)] border border-[var(--border-color)] text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>ALL TIME OVERVIEW</span>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants} className="card p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-muted)]">Net Cash Savings</span>
                        <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5" />
                        {summary.netBalance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-bold">TOTAL CASH BALANCE</div>
                </motion.div>

                <motion.div variants={itemVariants} className="card p-5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-muted)]">Total Cash Inflow</span>
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-500 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5" />
                        {summary.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase">Income to accounts</div>
                </motion.div>

                <motion.div variants={itemVariants} className="card p-5 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-muted)]">Total Credit Debt</span>
                        <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-500 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5" />
                        {(summary as any).creditDebt?.toLocaleString() || '0'}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase">Outstanding Dues</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Expenses Pie Chart */}
                <motion.div variants={itemVariants} className="card p-6 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center">
                            <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                            Expense by Category
                        </h3>
                    </div>
                    <div className="flex-1 w-full relative">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--text-color)' }}
                                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                                    />
                                    <Legend iconType="circle" verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-sm italic">
                                No expense data found.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Account Funds Distribution */}
                <motion.div variants={itemVariants} className="card p-6 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                            Funds by Account
                        </h3>
                    </div>
                    <div className="flex-1 w-full">
                        {accountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accountData} layout="vertical" margin={{ left: 30, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        stroke="var(--text-muted)"
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-color)', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                                    />
                                    <Bar dataKey="value" name="Balance" radius={[0, 4, 4, 0]} barSize={30}>
                                        {accountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ef4444' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-sm italic">
                                No account data found.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* List breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="card p-6">
                    <h3 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">Detailed Category Analysis</h3>
                    <div className="space-y-3">
                        {categoryData.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-color)]/50 hover:bg-[var(--bg-color)] transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-red-500">₹{cat.value.toLocaleString()}</span>
                                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-color)] font-bold">
                                        {((cat.value / summary.totalExpenses) * 100).toFixed(1)}%
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[var(--border-color)] group-hover:text-[var(--text-color)] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card p-6">
                    <h3 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">Account Portfolio</h3>
                    <div className="space-y-3">
                        {accountData.map((acc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-color)]/50 hover:bg-[var(--bg-color)] transition-all group">
                                <span className="text-sm font-medium">{acc.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-bold ${acc.value < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        ₹{acc.value.toLocaleString()}
                                    </span>
                                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-color)] font-bold">
                                        SHARE: {acc.value > 0 ? ((acc.value / Math.max(1, summary.netBalance)) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
