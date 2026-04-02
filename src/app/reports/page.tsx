"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    BarChart3, 
    ChevronLeft, 
    ChevronRight, 
    IndianRupee, 
    Calendar, 
    CalendarDays, 
    CalendarRange,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    ChevronDown
} from "lucide-react";
import { format, parseISO, getYear, getMonth, getISOWeek, setMonth } from "date-fns";
import { storage } from "@/lib/storage";
import { downloadCSV } from "@/lib/csvUtils";

type ReportLevel = 'yearly' | 'monthly' | 'weekly' | 'daily';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [viewLevel, setViewLevel] = useState<ReportLevel>('yearly');
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    
    const [allTransactions, setAllTransactions] = useState<any[]>([]);

    useEffect(() => {
        const txs = storage.getTransactions().filter(t => !t.is_pending);
        setAllTransactions(txs);
        setLoading(false);
    }, []);

    const hierarchy = useMemo(() => {
        const data: any = {};
        allTransactions.forEach(t => {
            const d = parseISO(t.date);
            const y = getYear(d);
            const m = getMonth(d);
            const w = getISOWeek(d);
            const dateStr = t.date;

            if (!data[y]) data[y] = { income: 0, expense: 0, months: {} };
            if (!data[y].months[m]) data[y].months[m] = { income: 0, expense: 0, weeks: {} };
            if (!data[y].months[m].weeks[w]) data[y].months[m].weeks[w] = { income: 0, expense: 0, days: {} };
            if (!data[y].months[m].weeks[w].days[dateStr]) data[y].months[m].weeks[w].days[dateStr] = { income: 0, expense: 0, transactions: [] };

            if (t.type === 'income') {
                data[y].income += t.amount;
                data[y].months[m].income += t.amount;
                data[y].months[m].weeks[w].income += t.amount;
                data[y].months[m].weeks[w].days[dateStr].income += t.amount;
            } else {
                data[y].expense += t.amount;
                data[y].months[m].expense += t.amount;
                data[y].months[m].weeks[w].expense += t.amount;
                data[y].months[m].weeks[w].days[dateStr].expense += t.amount;
            }
            data[y].months[m].weeks[w].days[dateStr].transactions.push(t);
        });
        return data;
    }, [allTransactions]);

    const handleBack = () => {
        if (viewLevel === 'daily') setViewLevel('weekly');
        else if (viewLevel === 'weekly') setViewLevel('monthly');
        else if (viewLevel === 'monthly') setViewLevel('yearly');
    };

    const handleExport = () => {
        if (allTransactions.length === 0) return;
        const exportData = allTransactions.map((t: any) => ({
            Date: t.date,
            Title: t.title,
            Type: t.type,
            Amount: t.amount,
            Category: t.category_id,
            Account: t.account_id
        }));
        downloadCSV(exportData, "Finance_Report_Export");
    };

    const renderSummaryCard = (title: string, income: number, expense: number, onClick?: () => void) => (
        <motion.div
            whileHover={{ scale: 1.01, borderColor: "rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`glass p-6 rounded-3xl border border-[var(--border-color)] transition-all ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight text-white/90">{title}</h3>
                {onClick && <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Income
                    </div>
                    <div className="text-xl font-black text-white flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5 opacity-50" />
                        {income.toLocaleString()}
                    </div>
                </div>
                <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center">
                        <ArrowDownRight className="w-3 h-3 mr-1" /> Expense
                    </div>
                    <div className="text-xl font-black text-white flex items-center">
                        <IndianRupee className="w-5 h-5 mr-0.5 opacity-50" />
                        {expense.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Net Surplus</span>
                <span className={`text-lg font-black ${(income - expense) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{(income - expense).toLocaleString()}
                </span>
            </div>
        </motion.div>
    );

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
    );

    const years = Object.keys(hierarchy).map(Number).sort((a,b)=>b-a);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {viewLevel !== 'yearly' && (
                        <button
                            onClick={handleBack}
                            className="p-3 bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-color)] transition-all shadow-xl"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            {viewLevel === 'yearly' && <><BarChart3 className="w-8 h-8 text-blue-500" /> Yearly Performance</>}
                            {viewLevel === 'monthly' && <><CalendarDays className="w-8 h-8 text-emerald-500" /> {selectedYear} Monthly Reports</>}
                            {viewLevel === 'weekly' && <><Calendar className="w-8 h-8 text-purple-500" /> {selectedYear} / {selectedMonth !== null ? format(setMonth(new Date(), selectedMonth), 'MMMM') : ''}</>}
                            {viewLevel === 'daily' && <><CalendarRange className="w-8 h-8 text-orange-400" /> Week {selectedWeek} Insights</>}
                        </h1>
                        <p className="text-[var(--text-muted)] font-medium text-sm mt-1 uppercase tracking-widest">
                            {viewLevel === 'yearly' ? 'Financial Drill-down Hierarchy' : `Drilling into ${selectedYear}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600/90 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Export Insights
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${viewLevel}-${selectedYear}-${selectedMonth}-${selectedWeek}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {viewLevel === 'yearly' && (
                        years.map(y => (
                            renderSummaryCard(y.toString(), hierarchy[y].income, hierarchy[y].expense, () => {
                                setSelectedYear(y);
                                setViewLevel('monthly');
                            })
                        ))
                    )}

                    {viewLevel === 'monthly' && selectedYear && (
                        Object.keys(hierarchy[selectedYear].months).map(Number).sort((a,b)=>a-b).map(m => (
                            renderSummaryCard(format(setMonth(new Date(), m), 'MMMM'), hierarchy[selectedYear].months[m].income, hierarchy[selectedYear].months[m].expense, () => {
                                setSelectedMonth(m);
                                setViewLevel('weekly');
                            })
                        ))
                    )}

                    {viewLevel === 'weekly' && selectedYear && selectedMonth !== null && (
                        Object.keys(hierarchy[selectedYear].months[selectedMonth].weeks).map(Number).sort((a,b)=>a-b).map(w => (
                            renderSummaryCard(`Week ${w}`, hierarchy[selectedYear].months[selectedMonth].weeks[w].income, hierarchy[selectedYear].months[selectedMonth].weeks[w].expense, () => {
                                setSelectedWeek(w);
                                setViewLevel('daily');
                            })
                        ))
                    )}

                    {viewLevel === 'daily' && selectedYear && selectedMonth !== null && selectedWeek !== null && (
                        <div className="col-span-full space-y-4">
                            {Object.keys(hierarchy[selectedYear].months[selectedMonth].weeks[selectedWeek].days).sort((a,b)=>parseISO(b).getTime() - parseISO(a).getTime()).map(dateStr => {
                                const dayData = hierarchy[selectedYear].months[selectedMonth].weeks[selectedWeek].days[dateStr];
                                const isExpanded = expandedDate === dateStr;
                                return (
                                    <div key={dateStr} className="glass rounded-3xl border border-[var(--border-color)] overflow-hidden transition-all duration-300">
                                        <div 
                                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
                                            onClick={() => setExpandedDate(isExpanded ? null : dateStr)}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center bg-blue-500/10 border border-blue-500/20 w-16 h-16 rounded-2xl">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{format(parseISO(dateStr), 'MMM')}</span>
                                                    <span className="text-2xl font-black text-white">{format(parseISO(dateStr), 'dd')}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-white/90">{format(parseISO(dateStr), 'EEEE')}</div>
                                                    <div className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">{dayData.transactions.length} Transactions</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="hidden sm:flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">In</div>
                                                        <div className="font-bold text-white">₹{dayData.income.toLocaleString()}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Out</div>
                                                        <div className="font-bold text-white">₹{dayData.expense.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-6 h-6 text-[var(--border-color)] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5"
                                                >
                                                    <div className="p-4 sm:p-6 space-y-3 bg-black/20">
                                                        {dayData.transactions.map((tx: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl group hover:border-white/20 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                        {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-white/90 group-hover:text-white transition-colors">{tx.title || "Untitled Transaction"}</div>
                                                                        <div className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">{tx.notes || "No notes provided"}</div>
                                                                    </div>
                                                                </div>
                                                                <div className={`text-lg font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && years.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 glass rounded-3xl border-2 border-dashed border-[var(--border-color)]">
                            <BarChart3 className="w-16 h-16 text-[var(--border-color)] mb-4" />
                            <h3 className="text-2xl font-black text-white/90">Zero Data Footprint</h3>
                            <p className="text-[var(--text-muted)] text-center max-w-sm mt-2 font-medium">Start recording your financial operations to generate sophisticated analytical metrics here.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
