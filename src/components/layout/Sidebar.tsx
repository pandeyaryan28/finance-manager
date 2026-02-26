"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ArrowRightLeft,
    PieChart,
    Wallet,
    BarChart3,
    LogOut,
    Settings,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Net Worth", href: "/net-worth", icon: Wallet },
    { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)] transition-transform sm:translate-x-0 hidden sm:flex flex-col">
            <div className="flex h-16 items-center px-6 border-b border-[var(--border-color)]">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                    Clarity
                </span>
            </div>

            <div className="flex flex-col justify-between flex-1 py-4 overflow-y-auto">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-[var(--text-muted)] hover:bg-[var(--bg-color)] hover:text-[var(--text-color)]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav-bg"
                                        className="absolute inset-0 rounded-lg bg-blue-50 dark:bg-blue-500/10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 z-10",
                                        isActive ? "text-blue-600 dark:text-blue-400" : "text-inherit"
                                    )}
                                />
                                <span className="z-10">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 space-y-1 mt-auto">
                    <button className="w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-color)] hover:text-[var(--text-color)] transition-colors">
                        <Settings className="h-5 w-5 shrink-0" />
                        <span>Settings</span>
                    </button>
                    <button className="w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
