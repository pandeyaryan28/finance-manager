"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, PiggyBank, LandPlot, Landmark, Building2, Briefcase, CarFront, Home, LineChart, TrendingUp, CreditCard } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { storage } from "@/lib/storage";

export default function NetWorthPage() {
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        history: [
            { month: "Sep", value: 450000 },
            { month: "Oct", value: 480000 },
            { month: "Nov", value: 475000 },
            { month: "Dec", value: 510000 },
            { month: "Jan", value: 540000 },
            { month: "Feb", value: 585000 },
        ]
    });

    useEffect(() => {
        const calculateNetWorth = () => {
            const accounts = storage.getAccounts();
            const transactions = storage.getTransactions();

            let assets = 0;
            let liabilities = 0;

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
            });

            setStats(prev => ({
                ...prev,
                totalAssets: assets,
                totalLiabilities: liabilities,
                netWorth: assets - liabilities
            }));
        };
        calculateNetWorth();
    }, []);

    const assets = [
        { name: "Bank Accounts", amount: stats.totalAssets, icon: <Landmark className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "Cash", amount: 0, icon: <PiggyBank className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Net Worth</h1>
                    <p className="text-[var(--text-muted)]">Real-time valuation of your wealth.</p>
                </div>
                <button className="flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                    <Plus className="h-4 w-4" />
                    <span>Add Asset/Liability</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex flex-col justify-between h-40">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Current Net Worth</span>
                    <div>
                        <div className="text-3xl font-bold tracking-tight">₹{stats.netWorth.toLocaleString()}</div>
                        <div className="mt-2 flex items-center text-sm text-emerald-500 font-medium">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>+4.2% from last month</span>
                        </div>
                    </div>
                </div>
                <div className="card p-6 flex flex-col justify-between h-40">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total Assets</span>
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-emerald-500">₹{stats.totalAssets.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-2">Physical & Digital Assets</div>
                    </div>
                </div>
                <div className="card p-6 flex flex-col justify-between h-40">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total Liabilities</span>
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-red-500">₹{stats.totalLiabilities.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-2">Debts & Credit Cards</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-6">Wealth Growth</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.history}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
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
                        <h3 className="font-semibold mb-4">Assets Distribution</h3>
                        <div className="space-y-4">
                            {assets.map((asset, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${asset.bg} ${asset.color}`}>
                                            {asset.icon}
                                        </div>
                                        <span className="text-sm font-medium">{asset.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">₹{asset.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
