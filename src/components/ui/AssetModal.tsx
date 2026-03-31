"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, IndianRupee, Calendar, Tag, Briefcase } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage } from "@/lib/storage";

const ASSET_TYPES = ['Stock', 'Mutual Fund', 'Fixed Deposit', 'Real Estate', 'Gold', 'Crypto', 'Other'] as const;

export function AssetModal() {
    const { activeModal, modalData, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        name: "",
        type: "Stock",
        invested_amount: "",
        current_value: "",
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ""
    });

    useEffect(() => {
        if (activeModal === "edit-asset" && modalData) {
            setForm({
                name: modalData.name || "",
                type: modalData.type || "Stock",
                invested_amount: modalData.invested_amount?.toString() || "",
                current_value: modalData.current_value?.toString() || "",
                purchase_date: modalData.purchase_date || new Date().toISOString().split('T')[0],
                notes: modalData.notes || ""
            });
        } else if (activeModal === "add-asset") {
            setForm({
                name: "",
                type: "Stock",
                invested_amount: "",
                current_value: "",
                purchase_date: new Date().toISOString().split('T')[0],
                notes: ""
            });
        }
    }, [activeModal, modalData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.type || !form.invested_amount) {
            alert("Please fill in required fields: Name, Type, and Invested Amount");
            return;
        }

        setLoading(true);
        try {
            const assetData = {
                name: form.name,
                type: form.type as any,
                invested_amount: parseFloat(form.invested_amount),
                current_value: form.current_value ? parseFloat(form.current_value) : parseFloat(form.invested_amount), // Fallback to invested
                purchase_date: form.purchase_date,
                notes: form.notes
            };

            if (activeModal === "edit-asset" && modalData?.id) {
                storage.updateAsset(modalData.id, assetData);
            } else {
                storage.addAsset(assetData);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                closeModal();
                window.location.reload();
            }, 1000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (activeModal !== "add-asset" && activeModal !== "edit-asset") return null;

    const isEdit = activeModal === "edit-asset";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="glass w-full max-w-lg shadow-2xl overflow-hidden relative rounded-3xl"
            >
                <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{isEdit ? "Edit Asset" : "Add Asset"}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">Portfolio Holding</p>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex-[2]">
                            <label className="text-sm font-semibold ml-1">Asset Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Apple Inc, HDFC FD..."
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Asset Type</label>
                            <select
                                required
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                {ASSET_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Invested Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    value={form.invested_amount}
                                    onChange={(e) => setForm({ ...form, invested_amount: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold ml-1">Current Value (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="number"
                                    placeholder={form.invested_amount || "0.00"}
                                    value={form.current_value}
                                    onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-emerald-500 focus:outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Purchase Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="date"
                                value={form.purchase_date}
                                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                                className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Notes (Optional)</label>
                        <input
                            type="text"
                            placeholder="Brokerage account, policy number..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] font-bold text-sm hover:bg-[var(--bg-color)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || success}
                            type="submit"
                            className="flex-[2] h-12 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                            ) : success ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                "Save Asset"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
