"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function MorphCard() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <motion.div
                layoutId="morph-card"
                onClick={() => setIsOpen(true)}
                className="glass p-6 rounded-2xl cursor-pointer w-64"
            >
                <motion.h3 layoutId="morph-title" className="text-xl font-bold">Financial Growth</motion.h3>
                <motion.p layoutId="morph-desc" className="text-sm text-dim mt-2">View detailed analytics of your wealth expansion over the last decade.</motion.p>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            layoutId="morph-card"
                            className="glass p-12 rounded-[2rem] max-w-2xl w-full relative z-10"
                        >
                            <motion.h3 layoutId="morph-title" className="text-4xl font-bold">Financial Growth</motion.h3>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8 space-y-6"
                            >
                                <div className="h-48 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                                <p className="text-lg text-dim">
                                    Comprehensive breakdown of your asset allocation, market trends, and risk management strategies.
                                    Our AI-driven pulse-checker ensures you are always aligned with your long-term fiscal objectives.
                                </p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                                >
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
