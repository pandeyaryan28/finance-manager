"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    PieChart as PieChartIcon,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Wallet,
    IndianRupee,
    ChevronRight,
    Calendar,
    CreditCard,
    BrainCircuit
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
    CartesianGrid,
    LabelList
} from "recharts";
import { storage } from "@/lib/storage";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [accountData, setAccountData] = useState<any[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        creditDebt: 0
    });
    const [portfolioData, setPortfolioData] = useState({
        creditCards: [] as any[],
        lendings: { lentAmount: 0, borrowedAmount: 0 },
        loans: 0,
        assets: 0,
        netWorth: 0
    });
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = () => {
            try {
                const transactions = storage.getTransactions();
                const categories = storage.getCategories();
                const accounts = storage.getAccounts();
                const creditCards = storage.getCreditCards();
                const creditSpends = storage.getCreditSpends();
                const assets = storage.getAssets();
                const lendings = storage.getLendingEntries();
                const loans = storage.getLoans();

                let liquidIncome = 0;
                let liquidExpenses = 0;
                let totalCreditSpend = 0;

                const catMap: Record<string, { value: number, transactions: any[] }> = {};

                transactions.forEach(t => {
                    if (t.is_pending) return;
                    if (t.type === 'expense') {
                        const cat = categories.find(c => c.id === t.category_id);
                        const catName = cat?.name || "Other";
                        if (!catMap[catName]) catMap[catName] = { value: 0, transactions: [] };
                        catMap[catName].value += t.amount;
                        catMap[catName].transactions.push(t);
                        liquidExpenses += t.amount;
                    } else {
                        liquidIncome += t.amount;
                    }
                });

                creditSpends.forEach(s => {
                    const cat = categories.find(c => c.id === s.category_id);
                    const catName = cat?.name || "Other";
                    if (!catMap[catName]) catMap[catName] = { value: 0, transactions: [] };
                    catMap[catName].value += s.amount;
                    catMap[catName].transactions.push(s);
                    totalCreditSpend += s.amount;
                });

                const formattedCatData = Object.entries(catMap).map(([name, data]) => ({
                    name,
                    value: data.value,
                    transactions: data.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                })).sort((a, b) => b.value - a.value);

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

                const creditData = creditCards.map(card => ({
                    name: card.name,
                    value: -card.current_balance,
                    type: 'credit'
                })).filter(c => Math.abs(c.value) > 0);

                const totalExp = liquidExpenses;
                const netBal = liquidIncome - totalExp;
                const debt = creditCards.reduce((acc, c) => acc + c.current_balance, 0);

                let lentAmount = 0;
                let borrowedAmount = 0;
                lendings.forEach(l => {
                    if (l.type === 'lent') lentAmount += l.remaining_amount;
                    else borrowedAmount += l.remaining_amount;
                });
                
                const totalAssets = assets.reduce((acc, a) => acc + a.current_value, 0);
                const remainingLoans = loans.reduce((acc, l) => acc + l.remaining_amount, 0);
                
                const netWorth = (totalAssets + netBal + lentAmount) - (debt + remainingLoans + borrowedAmount);

                setCategoryData(formattedCatData);
                setAccountData([...accData, ...creditData]);
                setSummary({
                    totalIncome: liquidIncome,
                    totalExpenses: totalExp,
                    netBalance: netBal,
                    creditDebt: debt
                });
                setPortfolioData({
                    creditCards,
                    lendings: { lentAmount, borrowedAmount },
                    loans: remainingLoans,
                    assets: totalAssets,
                    netWorth
                });

                // Generate Insights
                const generatedInsights: string[] = [];
                if (liquidIncome > 0) {
                    const savingsRate = ((netBal / liquidIncome) * 100).toFixed(1);
                    generatedInsights.push(`You saved ${savingsRate}% of your total inflow this period.`);
                }
                if (formattedCatData.length > 0) {
                    const topCat = formattedCatData[0];
                    const totalCombinedExp = liquidExpenses + totalCreditSpend;
                    const catPct = totalCombinedExp > 0 ? ((topCat.value / totalCombinedExp) * 100).toFixed(1) : "0.0";
                    generatedInsights.push(`${topCat.name} took the largest chunk of your expenses at ${catPct}%.`);
                }
                if (debt > 0 && netBal > 0) {
                    const debtRatio = ((debt / netBal) * 100).toFixed(1);
                    generatedInsights.push(`Your credit card dues equal ${debtRatio}% of your current liquid cash.`);
                }
                if (totalAssets > 0) {
                    generatedInsights.push(`You currently hold ₹${totalAssets.toLocaleString()} in registered assets & investments.`);
                }

                setInsights(generatedInsights);
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500" />
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
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ALL TIME OVERVIEW</span>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Net Cash Savings</span>
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.netBalance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Total Liquid Capital</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-slate-200 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Total Cash Inflow</span>
                        <div className="p-2 bg-slate-200/20 text-slate-200 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-100 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Income Velocity</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-orange-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Net Outflow</span>
                        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-orange-500 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.totalExpenses.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Total Expenses</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-red-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Total Credit Debt</span>
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-red-500 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.creditDebt.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Liability Burden</div>
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
                            <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
                            Funds by Account
                        </h3>
                    </div>
                    <div className="flex-1 w-full">
                        {accountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accountData} layout="vertical" margin={{ left: 5, right: 30, top: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={11}
                                        stroke="#ffffff"
                                        width={140}
                                        tick={{ fill: '#ffffff', fontWeight: 'bold', opacity: 0.9 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 10 }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }}
                                        formatter={(value: any) => [`₹${Math.abs(value).toLocaleString()}`, value < 0 ? 'LIABILITY' : 'ASSET']}
                                    />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                        {accountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ff3b3b' : '#10b981'} fillOpacity={0.9} />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="right"
                                            formatter={(val: any) => `₹${Math.abs(Number(val) || 0).toLocaleString()}`}
                                            style={{ fill: 'white', fontSize: 10, fontWeight: 'bold' }}
                                        />
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

            {/* AI Insights Module */}
            <motion.div variants={itemVariants} className="card p-6 bg-gradient-to-br from-[var(--card-color)] to-[var(--bg-color)] border border-emerald-500/20 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <h3 className="font-bold text-lg flex items-center mb-4 text-emerald-400">
                    <BrainCircuit className="w-5 h-5 mr-2" />
                    Data Insights
                </h3>
                {insights.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                                <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                                <p className="text-sm font-medium tracking-wide leading-relaxed text-white/90">{insight}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--text-muted)] italic relative z-10">Record more transactions to generate personalized insights.</p>
                )}
            </motion.div>

            {/* List breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="card p-6">
                    <h3 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">Detailed Category Analysis</h3>
                    <div className="space-y-3">
                        {categoryData.map((cat, i) => (
                            <div key={i} className="flex flex-col bg-[var(--bg-color)]/50 rounded-xl overflow-hidden group">
                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-[var(--bg-color)] cursor-pointer transition-all"
                                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm font-medium">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-red-500">₹{cat.value.toLocaleString()}</span>
                                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-color)] font-bold">
                                            {categoryData.reduce((acc, c) => acc + c.value, 0) > 0 ? ((cat.value / categoryData.reduce((acc, c) => acc + c.value, 0)) * 100).toFixed(1) : 0}%
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-[var(--border-color)] transition-transform ${expandedCategory === cat.name ? 'rotate-90 text-[var(--text-color)]' : 'group-hover:text-[var(--text-color)]'}`} />
                                    </div>
                                </div>
                                {expandedCategory === cat.name && cat.transactions && (
                                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--border-color)]/50 bg-black/20">
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {cat.transactions.map((tx: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-[var(--card-color)] p-2 rounded-lg">
                                                    <div>
                                                        <div className="text-xs font-semibold">{tx.title || tx.notes || "Transaction"}</div>
                                                        <div className="text-[10px] text-[var(--text-muted)]">{tx.date}</div>
                                                    </div>
                                                    <span className="text-xs font-bold text-white/80">₹{tx.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {cat.transactions.length === 0 && (
                                                <div className="text-xs text-[var(--text-muted)] p-2 text-center">No transactions found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                        ₹{Math.abs(acc.value).toLocaleString()}
                                    </span>
                                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-color)] font-bold">
                                        {acc.value > 0 ? ((acc.value / Math.max(1, summary.netBalance)) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Additional Portfolio Details */}
                <motion.div variants={itemVariants} className="card p-6 lg:col-span-2">
                    <h3 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">Comprehensive Portfolio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Credit Cards</h4>
                            <div className="space-y-2">
                                {portfolioData.creditCards.map((card: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span>{card.name}</span>
                                        <span className="text-red-400 font-bold">₹{card.current_balance.toLocaleString()} / ₹{card.limit.toLocaleString()}</span>
                                    </div>
                                ))}
                                {portfolioData.creditCards.length === 0 && <p className="text-xs text-[var(--text-muted)] italic">No credit cards</p>}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Lending & Borrowing</h4>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span>Owed to You</span>
                                <span className="text-emerald-400 font-bold">₹{portfolioData.lendings.lentAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>You Owe</span>
                                <span className="text-red-400 font-bold">₹{portfolioData.lendings.borrowedAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Loans & EMIs</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span>Total Remaining</span>
                                <span className="text-red-400 font-bold">₹{portfolioData.loans.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]">
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Assets</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span>Total Valuation</span>
                                <span className="text-emerald-400 font-bold">₹{portfolioData.assets.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--bg-color)]/50 border border-[var(--border-color)] lg:col-span-2">
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Net Worth</h4>
                            <div className="text-3xl font-black text-white/90">
                                ₹{portfolioData.netWorth.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">(Assets + Liquid + Owed to You) - (Credit + Loans + You Owe)</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
