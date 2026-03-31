"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, PiggyBank, Landmark, TrendingUp, CreditCard, Wallet, Landmark as BankIcon, Banknote } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { storage } from "@/lib/storage";

export default function NetWorthPage() {
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        distribution: [] as any[],
        history: [
            { name: "Week 1", value: 450000 },
            { name: "Week 2", value: 480000 },
            { name: "Week 3", value: 475000 },
            { name: "Week 4", value: 510000 },
        ]
    });

    useEffect(() => {
        const calculateNetWorth = () => {
            const accounts = storage.getAccounts();
            const transactions = storage.getTransactions();
            const creditCards = storage.getCreditCards();
            const investmentAssets = storage.getAssets();

            let assets = 0;
            let liabilities = 0;
            const dist: any[] = [];

            accounts.forEach(acc => {
                let balance = 0;
                transactions.forEach(tx => {
                    if (tx.account_id === acc.id && !tx.is_pending) {
                        if (tx.type === 'income') balance += tx.amount;
                        else balance -= tx.amount;
                    }
                });

                if (balance >= 0) assets += balance;
                else liabilities += Math.abs(balance);

                const icon = acc.type === 'Bank' ? <BankIcon className="w-4 h-4" /> :
                    <Banknote className="w-4 h-4" />;

                dist.push({
                    name: acc.name,
                    amount: balance,
                    icon: icon,
                    color: balance >= 0 ? "text-emerald-500" : "text-red-500",
                    bg: balance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                });
            });

            // Add Credit Cards to Liabilities
            creditCards.forEach(card => {
                liabilities += card.current_balance;
                dist.push({
                    name: card.name,
                    amount: -card.current_balance,
                    icon: <CreditCard className="w-4 h-4" />,
                    color: "text-red-500",
                    bg: "bg-red-500/10"
                });
            });

            // Add Investment Assets
            let totalInvestments = 0;
            investmentAssets.forEach(asset => {
                totalInvestments += asset.current_value;
            });

            if (totalInvestments > 0) {
                assets += totalInvestments;
                dist.push({
                    name: "Investment Portfolio",
                    amount: totalInvestments,
                    icon: <TrendingUp className="w-4 h-4" />,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10"
                });
            }

            setStats(prev => ({
                ...prev,
                totalAssets: assets,
                totalLiabilities: liabilities,
                netWorth: assets - liabilities,
                distribution: dist
            }));
        };
        calculateNetWorth();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Net Worth</h1>
                    <p className="text-[var(--text-muted)]">Interlinked with all your recorded account transactions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 text-sm font-medium hover:bg-[var(--bg-color)] transition-all shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span>Asset</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-muted)]">Current Net Worth</span>
                        <div className="p-2 bg-slate-200/10 text-slate-200 rounded-full">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-white">₹{stats.netWorth.toLocaleString()}</div>
                        <div className="mt-1 flex items-center text-xs text-slate-300 font-medium">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>Calculated from {stats.distribution.length} accounts</span>
                        </div>
                    </div>
                </div>
                <div className="card p-6 flex flex-col justify-between h-40 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total Liquidity (Assets)</span>
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-emerald-500">₹{stats.totalAssets.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Cash, Bank, Savings</div>
                    </div>
                </div>
                <div className="card p-6 flex flex-col justify-between h-40 border-l-4 border-l-red-500">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total Liabilities</span>
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-red-500">₹{stats.totalLiabilities.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Debts & Credit Card Dues</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-6">Growth Path (Simulation)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.history}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-color)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--text-muted)]">Account-wise interlink</h3>
                        <div className="space-y-4">
                            {stats.distribution.map((asset, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-color)] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${asset.bg} ${asset.color}`}>
                                            {asset.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{asset.name}</span>
                                            <span className="text-[10px] text-[var(--text-muted)] font-medium">REAL-TIME</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-sm font-bold ${asset.amount < 0 ? 'text-red-500' : ''}`}>
                                            ₹{asset.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {stats.distribution.length === 0 && (
                                <p className="text-xs text-[var(--text-muted)] text-center py-4">No accounts found. Add an account to see it here.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
