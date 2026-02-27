"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, Target, Activity, Plus, CreditCard, Landmark, Banknote } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useModal } from "@/lib/ModalContext";
import { storage, Transaction, Account } from "@/lib/storage";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
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
    chartData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const transactions = storage.getTransactions();
        const accounts = storage.getAccounts();

        let income = 0;
        let expenses = 0;
        transactions.forEach((t) => {
          if (t.is_pending) return;
          if (t.type === 'income') income += t.amount;
          else expenses += t.amount;
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

        // Group transactions by date for the last 7 days
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

          return {
            name: format(date, 'MMM dd'),
            income: dIncome,
            expense: dExpense
          };
        });

        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        setStats({
          balance,
          income,
          expenses,
          savingsRate: Math.max(0, savingsRate),
          transactions: transactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
          accounts: accountsWithBalance,
          chartData: chartData
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Credit Card': return <CreditCard className="w-4 h-4" />;
      case 'Bank': return <Landmark className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">Live monitoring & Account tracking.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("add-category")}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 text-sm font-medium hover:bg-[var(--bg-color)] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Category</span>
          </button>
          <button
            onClick={() => openModal("add-account")}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 text-sm font-medium hover:bg-[var(--bg-color)] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Account</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.accounts.map((acc) => (
          <motion.div
            key={acc.id}
            variants={itemVariants}
            className="p-4 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] group hover:border-blue-500/50 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--bg-color)] text-[var(--text-muted)]">
                  {getAccountIcon(acc.type)}
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{acc.name}</span>
              </div>
            </div>
            <div className={`text-xl font-bold ${acc.balance < 0 ? 'text-red-500' : 'text-blue-500'}`}>
              ₹{acc.balance.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants} className="card p-5 group flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Net Balance</span>
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight mt-1 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {stats.balance.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-5 group flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Total Income</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight mt-1 flex items-center text-emerald-500">
              <IndianRupee className="h-5 w-5 mr-1" />
              {stats.income.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-5 group flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Total Expenses</span>
            <span className="p-2 bg-red-500/10 text-red-500 rounded-full">
              <ArrowDownRight className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight mt-1 flex items-center text-red-500">
              <IndianRupee className="h-5 w-5 mr-1" />
              {stats.expenses.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-5 group flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Savings Rate</span>
            <span className="p-2 bg-purple-500/10 text-purple-500 rounded-full">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight mt-1">{stats.savingsRate.toFixed(1)}%</div>
            <div className="w-full bg-[var(--bg-color)] rounded-full h-1 mt-2 overflow-hidden">
              <motion.div
                className="bg-purple-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.savingsRate}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Cash Flow (Last 7 Days)</h3>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--text-color)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} fill="#3b82f6" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={0.1} fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Recent Ledger</h3>
            <Link href="/transactions" className="text-sm text-blue-500 font-medium hover:text-blue-600">View All</Link>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {stats.transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Activity className="w-12 h-12 text-[var(--text-muted)] opacity-20 mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No transactions yet.</p>
              </div>
            ) : (
              stats.transactions.map((tx: any, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--bg-color)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-opacity-10 dark:bg-opacity-20 flex-shrink-0
                      ${tx.type === 'expense' ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}
                      ${tx.is_pending ? 'opacity-50 grayscale' : ''}
                    `}>
                      {tx.type === 'expense' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm group-hover:text-blue-500 transition-colors line-clamp-1">{tx.title}</div>
                        {tx.is_pending && <span className="text-[9px] px-1 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold uppercase tracking-tighter">PENDING</span>}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{(tx as any).category?.name} • {(tx as any).account?.name}</div>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm whitespace-nowrap ${tx.type === 'expense' ? '' : 'text-emerald-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
