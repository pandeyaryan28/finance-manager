"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, IndianRupee, Landmark, Wallet, CreditCard, ChevronDown } from "lucide-react";
import { useModal } from "@/lib/ModalContext";
import { storage, Account, CreditCard as CreditCardType } from "@/lib/storage";

export default function CreditCardPaymentModal() {
    const { activeModal, closeModal } = useModal();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cards, setCards] = useState<CreditCardType[]>([]);

    const [formData, setFormData] = useState({
        card_id: "",
        from_account_id: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
    });

    useEffect(() => {
        if (activeModal === "add-credit-repayment") {
            setAccounts(storage.getAccounts());
            setCards(storage.getCreditCards());

            // Set defaults if available
            const accs = storage.getAccounts();
            const crds = storage.getCreditCards();
            if (accs.length > 0) setFormData(prev => ({ ...prev, from_account_id: accs[0].id }));
            if (crds.length > 0) setFormData(prev => ({ ...prev, card_id: crds[0].id }));
        }
    }, [activeModal]);

    const handleSave = () => {
        if (!formData.card_id || !formData.from_account_id || !formData.amount) {
            alert("Please fill in all mandatory fields");
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        storage.addCreditRepayment({
            card_id: formData.card_id,
            from_account_id: formData.from_account_id,
            amount: amount,
            date: formData.date,
            notes: formData.notes
        });

        closeModal();
        window.location.reload();
    };

    if (activeModal !== "add-credit-repayment") return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl"
                >
                    <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Credit Card Repayment</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold">Reduce debt & Update liquidity</p>
                        </div>
                        <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--bg-color)] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Select Credit Card */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Select Credit Card</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-blue-500" />
                                <select
                                    value={formData.card_id}
                                    onChange={(e) => setFormData({ ...formData, card_id: e.target.value })}
                                    className="w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    <option value="">Select a card</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id}>{card.name} (Debt: ₹{card.current_balance})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                            </div>
                        </div>

                        {/* Select Payment Source */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Pay From (Account)</label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500" />
                                <select
                                    value={formData.from_account_id}
                                    onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                                    className="w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Repayment Amount</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Notes (Optional)</label>
                            <textarea
                                placeholder="Bank reference, statement month, etc."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full h-24 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex gap-3">
                        <button
                            onClick={closeModal}
                            className="flex-1 h-12 rounded-2xl font-bold text-sm hover:bg-[var(--border-color)] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                        >
                            Confirm Repayment
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
