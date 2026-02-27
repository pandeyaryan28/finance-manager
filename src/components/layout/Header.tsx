"use client";

import { Bell, Plus, Search } from "lucide-react";
import { useModal } from "@/lib/ModalContext";

export function Header() {
    const { openModal } = useModal();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-color)]/80 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="h-9 w-full rounded-full border border-[var(--border-color)] bg-[var(--card-color)] pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--card-color)] text-[var(--text-muted)] transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--bg-color)]"></span>
                </button>

                <div className="h-8 w-px bg-[var(--border-color)] hidden sm:block"></div>

                <button
                    onClick={() => openModal("add-expense")}
                    className="flex h-9 px-4 items-center justify-center gap-2 rounded-full bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all font-medium"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Expense</span>
                </button>

                <button
                    onClick={() => openModal("add-income")}
                    className="flex h-9 px-4 items-center justify-center gap-2 rounded-full bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 hover:bg-emerald-600 hover:text-white transition-all font-medium"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Income</span>
                </button>

                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-1 sm:ml-2 shadow-sm border-2 border-white dark:border-[var(--card-color)] shrink-0" />
            </div>
        </header>
    );
}
