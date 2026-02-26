"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, PiggyBank, LandPlot, Landmark, Building2, Briefcase, CarFront, Home, LineChart, TrendingUp, CreditCard } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function NetWorthPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/net-worth/");
                const data = await res.json();
                setItems(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalAssets = items.filter((i: any) => i.item_type === 'asset').reduce((acc, curr: any) => acc + curr.amount, 0);
    const totalLiabilities = items.filter((i: any) => i.item_type === 'liability').reduce((acc, curr: any) => acc + curr.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const chartData = [
        { name: "Live", worth: netWorth }
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Net Worth</h1>
                    <p className="text-[var(--text-muted)]">Track your total assets and liabilities.</p>
                </div>
                <button
                    onClick={() => alert("Add Account functionality implemented in API, UI form coming soon! Use 'Add Transaction' to start tracking movements.")}
                    className="flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Account</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-3 card p-6 lg:p-8 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative overflow-hidden border-none shadow-xl"
                >
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div>
                                <div className="text-blue-200 font-medium text-lg flex items-center mb-1">
                                    <LineChart className="w-5 h-5 mr-2" />
                                    Total Net Worth
                                </div>
                                <div className="text-5xl lg:text-6xl font-extrabold tracking-tight">
                                    <span className="text-3xl text-blue-300 opacity-60 mr-1">₹</span>
                                    {netWorth.toLocaleString()}
                                </div>
                            </div>

                            <div className="flex gap-8">
                                <div>
                                    <div className="text-emerald-300 font-medium mb-1">Assets</div>
                                    <div className="text-xl font-bold">₹{totalAssets.toLocaleString()}</div>
                                </div>
                                <div className="hidden sm:block w-px bg-white/20"></div>
                                <div>
                                    <div className="text-rose-300 font-medium mb-1">Liabilities</div>
                                    <div className="text-xl font-bold">₹{totalLiabilities.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="h-48 lg:h-56 mt-4 lg:mt-0 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="worth" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="rgba(255,255,255,0.1)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-2 card p-6 border-[var(--border-color)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Assets</h2>
                        <div className="text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg">₹{totalAssets.toLocaleString()}</div>
                    </div>

                    <div className="space-y-4">
                        {items.filter((i: any) => i.item_type === 'asset').map((asset: any, i: number) => (
                            <div key={asset.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><PiggyBank className="h-5 w-5" /></div>
                                    <div><div className="font-semibold">{asset.name}</div><div className="text-xs text-[var(--text-muted)]">{asset.category}</div></div>
                                </div>
                                <div className="font-bold text-lg">₹{asset.amount.toLocaleString()}</div>
                            </div>
                        ))}
                        {items.filter((i: any) => i.item_type === 'asset').length === 0 && (
                            <p className="p-8 text-center text-[var(--text-muted)]">No assets listed yet.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 card p-6 border-[var(--border-color)] h-fit"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Liabilities</h2>
                        <div className="text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg">₹{totalLiabilities.toLocaleString()}</div>
                    </div>
                    {items.filter((i: any) => i.item_type === 'liability').length === 0 && (
                        <p className="p-8 text-center text-[var(--text-muted)]">No liabilities yet.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
