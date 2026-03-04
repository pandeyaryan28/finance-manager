"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { useModal } from "@/lib/ModalContext";
import { storage, Transaction, Account } from "@/lib/storage";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

export default function Dashboard() {
  const { openModal } = useModal();
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    transactions: [] as (Transaction & { category?: any, account?: any })[],
    accounts: [] as any[],
    chartData: [] as any[],
    creditDebt: 0,
    creditLimit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const transactions = storage.getTransactions();
        const accounts = storage.getAccounts();
        const creditSpends = storage.getCreditSpends();
        const creditCards = storage.getCreditCards();

        let liquidIncome = 0;
        let liquidExpenses = 0;
        let totalCreditSpend = 0;

        transactions.forEach((t) => {
          if (t.is_pending) return;
          if (t.type === 'income') liquidIncome += t.amount;
          else liquidExpenses += t.amount;
        });

        creditSpends.forEach(s => {
          totalCreditSpend += s.amount;
        });

        const accountsWithBalance = accounts.map((acc) => {
          let accBalance = 0;
          transactions.forEach((t) => {
            if (t.account_id === acc.id && !t.is_pending) {
              if (t.type === 'income') accBalance += t.amount;
              else accBalance -= t.amount;
            }
          });
          return { ...acc, balance: accBalance };
        });

        const totalCreditDebt = creditCards.reduce((acc, c) => acc + c.current_balance, 0);
        const totalCreditLimit = creditCards.reduce((acc, c) => acc + c.limit, 0);

        const endDate = startOfDay(new Date());
        const startDate = subDays(endDate, 6);
        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

        const chartData = dateInterval.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          let dIncome = 0;
          let dExpense = 0;

          transactions.forEach(t => {
            if (t.date === dateStr && !t.is_pending) {
              if (t.type === 'income') dIncome += t.amount;
              else dExpense += t.amount;
            }
          });

          creditSpends.forEach(s => {
            if (s.date === dateStr) {
              dExpense += s.amount;
            }
          });

          return {
            name: format(date, 'MMM dd'),
            income: dIncome,
            expense: dExpense
          };
        });

        const totalExpenses = liquidExpenses + totalCreditSpend;
        const savingsRate = liquidIncome > 0 ? ((liquidIncome - totalExpenses) / liquidIncome) * 100 : 0;

        setStats({
          balance: liquidIncome - liquidExpenses,
          income: liquidIncome,
          expenses: totalExpenses,
          savingsRate: Math.max(0, savingsRate),
          transactions: transactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
          accounts: accountsWithBalance,
          chartData: chartData,
          creditDebt: totalCreditDebt,
          creditLimit: totalCreditLimit
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Quick Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Your financial overview at a glance.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal("add-expense")}
            className="flex h-10 items-center gap-2 rounded-xl bg-white text-black px-5 text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Expense
          </button>
          <button
            onClick={() => openModal("add-income")}
            className="flex h-10 items-center gap-2 rounded-xl glass border border-white/10 px-5 text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Income
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Liquid Cash</p>
            <h3 className="text-3xl font-black text-white">₹{stats.balance.toLocaleString()}</h3>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Credit Card Bill</p>
            <h3 className="text-3xl font-black text-red-500">₹{stats.creditDebt.toLocaleString()}</h3>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Monthly Inflow</p>
            <h3 className="text-3xl font-black text-emerald-500">₹{stats.income.toLocaleString()}</h3>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Monthly Outflow</p>
            <h3 className="text-3xl font-black text-amber-500">₹{stats.expenses.toLocaleString()}</h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem] lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Cash Velocity</h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Income</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expense</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'black', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem' }}
                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" fill="url(#fade)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" stroke="#ff4d4d" fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Ledger */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-[2rem]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Pulse</h3>
              <Link href="/transactions" className="text-xs text-dim hover:text-white transition-colors">View All</Link>
            </div>
            <div className="space-y-4">
              {stats.transactions.map((tx, i) => (
                <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {tx.type === 'expense' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{tx.title}</p>
                      <p className="text-[10px] text-dim">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === 'expense' ? 'text-white' : 'text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
              {stats.transactions.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">No transactions yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
