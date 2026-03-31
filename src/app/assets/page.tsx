"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, TrendingUp, Trash2, Edit2, Briefcase,
    IndianRupee, Activity, Building, Component,
    ArrowUpRight, ArrowDownRight, CircleDollarSign
} from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Asset } from "@/lib/storage";

export default function AssetsPage() {
    const { openModal } = useModal();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        try {
            setAssets(storage.getAssets());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        storage.deleteAsset(id);
        fetchData();
    };

    const handleEdit = (asset: Asset) => {
        openModal("edit-asset", asset);
    };

    const totalInvested = assets.reduce((acc, a) => acc + a.invested_amount, 0);
    const totalCurrent = assets.reduce((acc, a) => acc + a.current_value, 0);
    const totalProfit = totalCurrent - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const isProfitable = totalProfit >= 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } as any }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } as any }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'Stock': return Activity;
            case 'Mutual Fund': return PieChartIcon;
            case 'Fixed Deposit': return LandmarkIcon;
            case 'Real Estate': return Building;
            case 'Gold': return CircleDollarSign;
            case 'Crypto': return Component;
            default: return Briefcase;
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Investment Assets</h1>
                    <p className="text-[var(--text-muted)] mt-1">Track your portfolio, real estate, and other wealth-building assets.</p>
                </div>
                <button
                    onClick={() => openModal("add-asset")}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Asset</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-[var(--border-color)]">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Invested</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Cost basis across all assets</div>
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Current Value</span>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-emerald-500">₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Estimated market value</div>
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className={`card p-6 border-l-4 ${isProfitable ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                    <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Overall Return</span>
                    <div className="mt-4 flex items-baseline gap-2">
                        <div className={`text-2xl font-bold flex items-center gap-1 ${isProfitable ? 'text-blue-500' : 'text-red-500'}`}>
                            {isProfitable ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            ₹{Math.abs(totalProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${isProfitable ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isProfitable ? '+' : ''}{profitPercentage.toFixed(2)}%
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Assets List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {assets.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-40 flex flex-col items-center justify-center text-[var(--text-muted)] card border-dashed">
                            <Briefcase className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm font-medium">No assets recorded yet.</p>
                        </motion.div>
                    ) : (
                        assets.map((asset) => {
                            const Icon = getIconForType(asset.type);
                            const profit = asset.current_value - asset.invested_amount;
                            const pct = asset.invested_amount > 0 ? (profit / asset.invested_amount) * 100 : 0;
                            const isPositive = profit >= 0;

                            return (
                                <motion.div key={asset.id} layout variants={itemVariants} className="group">
                                    <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--border-color)] hover:shadow-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg">{asset.name}</h3>
                                                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-full bg-[var(--bg-color)] border border-[var(--border-color)]">
                                                        {asset.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                                                    Invested: ₹{asset.invested_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    {asset.purchase_date && ` • Since ${new Date(asset.purchase_date).toLocaleDateString()}`}
                                                </div>
                                                {asset.notes && <div className="text-xs text-[var(--text-muted)] italic mt-1">{asset.notes}</div>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-color)]">
                                            <div className="text-left md:text-right">
                                                <div className="text-xl font-bold whitespace-nowrap">₹{asset.current_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                                <div className={`text-xs font-bold flex items-center justify-start md:justify-end gap-1 ${isPositive ? 'text-blue-500' : 'text-red-500'}`}>
                                                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {isPositive ? '+' : ''}{pct.toFixed(1)}% (₹{Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(asset)}
                                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-blue-500/10 hover:text-blue-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(asset.id, asset.name)}
                                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Icons
const PieChartIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);

const LandmarkIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
);
