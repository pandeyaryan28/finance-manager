"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    PieChart as PieChartIcon,
    TrendingUp,
    TrendingDown,
    Wallet,
    IndianRupee,
    ChevronRight,
    ChevronLeft,
    CreditCard,
    BrainCircuit,
    Calendar,
    BarChart3
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import { 
    format, 
    parseISO, 
    startOfMonth, 
    endOfMonth, 
    startOfISOWeek, 
    endOfISOWeek, 
    startOfYear, 
    endOfYear,
    subMonths,
    addMonths,
    subWeeks,
    addWeeks,
    subYears,
    addYears,
    isWithinInterval
} from "date-fns";
import { storage } from "@/lib/storage";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type FilterType = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<FilterType>('month');
    const [filterDate, setFilterDate] = useState(new Date());
    
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        creditDebt: 0
    });
    const [portfolioData, setPortfolioData] = useState({
        accounts: [] as any[],
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

                // Determine interval
                let start: Date, end: Date;
                if (filterType === 'week') {
                    start = startOfISOWeek(filterDate);
                    end = endOfISOWeek(filterDate);
                } else if (filterType === 'month') {
                    start = startOfMonth(filterDate);
                    end = endOfMonth(filterDate);
                } else {
                    start = startOfYear(filterDate);
                    end = endOfYear(filterDate);
                }

                const isInInterval = (dateStr: string) => {
                    const d = parseISO(dateStr);
                    return isWithinInterval(d, { start, end });
                };

                // Filter data based on timeframe
                let liquidIncome = 0;
                let liquidExpenses = 0;
                let totalCreditSpend = 0;
                const catMap: Record<string, { value: number, transactions: any[] }> = {};

                transactions.forEach(t => {
                    if (t.is_pending || !isInInterval(t.date)) return;
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
                    if (!isInInterval(s.date)) return;
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

                // Account Balances (Currently shows lifetime balance as per storage logic)
                const accData = accounts.map(acc => {
                    let balance = 0;
                    transactions.forEach(t => {
                        if (t.account_id === acc.id && !t.is_pending) {
                            if (t.type === 'income') balance += t.amount;
                            else balance -= t.amount;
                        }
                    });
                    return { ...acc, balance };
                });

                const debt = creditCards.reduce((acc, c) => acc + c.current_balance, 0);

                let lentAmount = 0;
                let borrowedAmount = 0;
                lendings.forEach(l => {
                    if (l.type === 'lent') lentAmount += l.remaining_amount;
                    else borrowedAmount += l.remaining_amount;
                });
                
                const totalAssets = assets.reduce((acc, a) => acc + a.current_value, 0);
                const remainingLoans = loans.reduce((acc, l) => acc + l.remaining_amount, 0);
                
                // Net Worth calculation stays same (overall)
                const netWorth = (totalAssets + accData.reduce((sum, a) => sum + a.balance, 0) + lentAmount) - (debt + remainingLoans + borrowedAmount);

                setCategoryData(formattedCatData);
                setSummary({
                    totalIncome: liquidIncome,
                    totalExpenses: liquidExpenses + totalCreditSpend,
                    netBalance: liquidIncome - (liquidExpenses + totalCreditSpend),
                    creditDebt: debt
                });
                setPortfolioData({
                    accounts: accData,
                    creditCards,
                    lendings: { lentAmount, borrowedAmount },
                    loans: remainingLoans,
                    assets: totalAssets,
                    netWorth
                });

                // Generate Insights
                const generatedInsights: string[] = [];
                if (liquidIncome > 0) {
                    const savingsRate = (((liquidIncome - (liquidExpenses + totalCreditSpend)) / liquidIncome) * 100).toFixed(1);
                    generatedInsights.push(`You saved ${savingsRate}% of your total inflow this ${filterType}.`);
                }
                if (formattedCatData.length > 0) {
                    const topCat = formattedCatData[0];
                    const totalCombinedExp = liquidExpenses + totalCreditSpend;
                    const catPct = totalCombinedExp > 0 ? ((topCat.value / totalCombinedExp) * 100).toFixed(1) : "0.0";
                    generatedInsights.push(`${topCat.name} was your highest expense category at ${catPct}%.`);
                }
                setInsights(generatedInsights);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filterType, filterDate]);

    const navigateFilter = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -1 : 1;
        if (filterType === 'week') setFilterDate(d => amount === -1 ? subWeeks(d, 1) : addWeeks(d, 1));
        else if (filterType === 'month') setFilterDate(d => amount === -1 ? subMonths(d, 1) : addMonths(d, 1));
        else setFilterDate(d => amount === -1 ? subYears(d, 1) : addYears(d, 1));
    };

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
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
                    <p className="text-[var(--text-muted)] font-medium uppercase tracking-widest text-xs mt-1">Deep Intelligence Engine</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--card-color)] p-2 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex bg-[var(--bg-color)] p-1 rounded-xl border border-white/5">
                        {(['week', 'month', 'year'] as FilterType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-blue-500 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-4 px-4 bg-black/20 py-1.5 rounded-xl border border-white/5">
                        <button onClick={() => navigateFilter('prev')} className="p-1 hover:text-blue-400 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-black whitespace-nowrap min-w-[120px] text-center">
                            {filterType === 'week' && `Week of ${format(startOfISOWeek(filterDate), 'MMM dd')}`}
                            {filterType === 'month' && format(filterDate, 'MMMM yyyy')}
                            {filterType === 'year' && format(filterDate, 'yyyy')}
                        </span>
                        <button onClick={() => navigateFilter('next')} className="p-1 hover:text-blue-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Efficiency (Net)</span>
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.netBalance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Surplus for this Period</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-blue-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Gross Income</span>
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-blue-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Total Inflow</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-orange-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Total Spend</span>
                        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-orange-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.totalExpenses.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Liquid + Credit Spend</div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-l-4 border-l-red-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white/70">Debt Exposure</span>
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-red-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {summary.creditDebt.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 mt-2 font-black tracking-widest uppercase">Current Liabilities</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-lg flex items-center uppercase tracking-widest">
                            <PieChartIcon className="w-6 h-6 mr-3 text-purple-500" />
                            Expense Architecture
                        </h3>
                    </div>
                    <div className="h-[350px] w-full relative">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                                    />
                                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-sm italic font-bold">
                                No Transactions Found for this Period
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Funds by Account View */}
                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-lg flex items-center uppercase tracking-widest">
                            <BarChart3 className="w-6 h-6 mr-3 text-emerald-500" />
                            Liquidity Structure
                        </h3>
                    </div>
                    <div className="space-y-5 max-h-[350px] overflow-y-auto custom-scrollbar pr-2 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                        {portfolioData.accounts.map((acc, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-white/90">{acc.name}</span>
                                    <span className="text-sm font-black text-emerald-400">₹{acc.balance.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full opacity-40 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] mt-1 uppercase font-bold tracking-tighter">Liquid Capital</div>
                            </div>
                        ))}
                        
                        {portfolioData.creditCards.map((card, i) => {
                            const ratio = Math.min(100, (card.current_balance / card.limit) * 100);
                            return (
                                <div key={`cc-${i}`} className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">{card.name}</span>
                                            <span className="text-[10px] text-red-400/80 uppercase font-black tracking-widest">Credit Liability</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-red-400">₹{card.current_balance.toLocaleString()} Used</div>
                                            <div className="text-[10px] text-white/40 font-bold">Limit: ₹{card.limit.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden relative">
                                        <div 
                                            className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                                            style={{ width: `${ratio}%` }} 
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-white/30 font-bold italic">Utilization: {ratio.toFixed(1)}%</span>
                                        <span className="text-[10px] text-white/30 font-bold italic">Available: ₹{(card.limit - card.current_balance).toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl">
                    <h3 className="font-black text-xs text-[var(--text-muted)] uppercase tracking-widest mb-6">Detailed Spend Analysis</h3>
                    <div className="space-y-3">
                        {categoryData.slice(0, 8).map((cat, i) => (
                            <div key={i} className="flex flex-col bg-white/5 rounded-2xl overflow-hidden group">
                                <div 
                                    className="flex items-center justify-between p-4 hover:bg-white/10 cursor-pointer transition-all"
                                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm font-bold text-white/80">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm font-black text-red-400">₹{cat.value.toLocaleString()}</span>
                                        <div className="text-[10px] px-2 py-1 rounded-lg bg-black/40 font-black border border-white/5">
                                            {categoryData.reduce((acc, c) => acc + c.value, 0) > 0 ? ((cat.value / categoryData.reduce((acc, c) => acc + c.value, 0)) * 100).toFixed(1) : 0}%
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-white/20 transition-transform ${expandedCategory === cat.name ? 'rotate-90 text-white' : 'group-hover:text-white'}`} />
                                    </div>
                                </div>
                                {expandedCategory === cat.name && cat.transactions && (
                                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5 bg-black/40">
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                                            {cat.transactions.map((tx: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                                    <div>
                                                        <div className="text-xs font-bold text-white/90">{tx.title || "Transaction"}</div>
                                                        <div className="text-[10px] text-[var(--text-muted)] font-bold">{tx.date}</div>
                                                    </div>
                                                    <span className="text-xs font-black text-white/80">₹{tx.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-3xl">
                    <h3 className="font-black text-xs text-[var(--text-muted)] uppercase tracking-widest mb-6">Asset vs Liability Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Capital Outflow</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/70">Owed to People</span>
                                    <span className="text-red-400 font-black">₹{portfolioData.lendings.borrowedAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/70">Remaining Loans</span>
                                    <span className="text-red-400 font-black">₹{portfolioData.loans.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Capital Appraisal</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/70">Owed to You</span>
                                    <span className="text-emerald-400 font-black">₹{portfolioData.lendings.lentAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/70">Asset Valuation</span>
                                    <span className="text-emerald-400 font-black">₹{portfolioData.assets.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 md:col-span-2">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Net Worth</h4>
                            <div className="text-4xl font-black text-white decoration-blue-500/50 underline-offset-8">
                                ₹{portfolioData.netWorth.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-white/40 mt-3 font-bold italic leading-relaxed">
                                Calculated across all liquid accounts, registered assets, and total liability exposure.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="glass p-8 rounded-[40px] bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none animate-pulse" />
                <h3 className="font-black text-xl flex items-center mb-6 text-emerald-400 uppercase tracking-widest">
                    <BrainCircuit className="w-8 h-8 mr-4" />
                    Cognitive Insights
                </h3>
                {insights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-5 p-6 rounded-3xl bg-black/30 border border-white/5 backdrop-blur-xl group hover:border-emerald-500/30 transition-all shadow-2xl">
                                <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-bold tracking-wide leading-relaxed text-white/90">{insight}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--text-muted)] italic font-bold">Establishing data patterns... Record more financial operations to activate.</p>
                )}
            </motion.div>
        </motion.div>
    );
}
