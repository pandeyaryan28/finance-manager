"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { format, parseISO, getISOWeek, getYear, getMonth, setMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, ChevronLeft, ChevronRight, CalendarDays, BarChart, CalendarRange } from "lucide-react";

export function ReportsView() {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [reportData, setReportData] = useState<any>({});

    useEffect(() => {
        const txs = storage.getTransactions();
        const data: any = {};

        txs.forEach(t => {
            if (t.is_pending) return;
            const d = parseISO(t.date);
            const y = getYear(d);
            const m = getMonth(d);
            const w = getISOWeek(d);

            if (!data[y]) data[y] = { income: 0, expense: 0, months: {} };
            if (!data[y].months[m]) data[y].months[m] = { income: 0, expense: 0, weeks: {} };
            if (!data[y].months[m].weeks[w]) data[y].months[m].weeks[w] = { income: 0, expense: 0 };

            if (t.type === 'income') {
                data[y].income += t.amount;
                data[y].months[m].income += t.amount;
                data[y].months[m].weeks[w].income += t.amount;
            } else {
                data[y].expense += t.amount;
                data[y].months[m].expense += t.amount;
                data[y].months[m].weeks[w].expense += t.amount;
            }
        });

        setReportData(data);
    }, []);

    const years = Object.keys(reportData).map(Number).sort((a,b)=>b-a);

    const formatMonth = (m: number) => format(setMonth(new Date(), m), 'MMMM');

    const renderCard = (title: string, income: number, expense: number, onClick?: () => void) => (
        <motion.div
            whileHover={onClick ? { scale: 1.01 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            onClick={onClick}
            className={`card p-6 flex flex-col justify-between ${onClick ? 'cursor-pointer hover:border-blue-500/30' : ''}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                {onClick && <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Income</div>
                    <div className="text-lg font-bold text-white flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5 opacity-70" />
                        {income.toLocaleString()}
                    </div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Expense</div>
                    <div className="text-lg font-bold text-white flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5 opacity-70" />
                        {expense.toLocaleString()}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)] font-medium">Net Savings</span>
                <span className={`font-bold ${(income - expense) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{(income - expense).toLocaleString()}
                </span>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {selectedYear !== null && (
                        <button
                            onClick={() => selectedMonth !== null ? setSelectedMonth(null) : setSelectedYear(null)}
                            className="p-2 hover:bg-[var(--bg-color)] rounded-xl transition-colors border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {selectedYear === null ? (
                                <><BarChart className="w-6 h-6 text-blue-500" /> Yearly Reports</>
                            ) : selectedMonth === null ? (
                                <><CalendarDays className="w-6 h-6 text-emerald-500" /> {selectedYear} Monthly Reports</>
                            ) : (
                                <><CalendarRange className="w-6 h-6 text-purple-500" /> {formatMonth(selectedMonth)} {selectedYear} Weekly Reports</>
                            )}
                        </h2>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedYear}-${selectedMonth}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {selectedYear === null ? (
                        years.map(y => (
                            <div key={y}>
                                {renderCard(y.toString(), reportData[y].income, reportData[y].expense, () => setSelectedYear(y))}
                            </div>
                        ))
                    ) : selectedMonth === null ? (
                        Object.keys(reportData[selectedYear].months).map(Number).sort((a,b)=>a-b).map(m => (
                            <div key={m}>
                                {renderCard(formatMonth(m), reportData[selectedYear].months[m].income, reportData[selectedYear].months[m].expense, () => setSelectedMonth(m))}
                            </div>
                        ))
                    ) : (
                        Object.keys(reportData[selectedYear].months[selectedMonth].weeks).map(Number).sort((a,b)=>a-b).map(w => (
                            <div key={w}>
                                {renderCard(`Week ${w}`, reportData[selectedYear].months[selectedMonth].weeks[w].income, reportData[selectedYear].months[selectedMonth].weeks[w].expense)}
                            </div>
                        ))
                    )}
                    
                    {years.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[var(--text-muted)] italic">
                            No reporting data available. Start adding transactions first.
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
