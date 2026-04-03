"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, CreditCard, CircleDollarSign, BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { storage, Transaction, Account } from "@/lib/storage";
import { format, startOfDay, eachDayOfInterval, subDays, isSameMonth } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
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
        const allTransactions = storage.getTransactions();
        const accounts = storage.getAccounts();
        const creditSpends = storage.getCreditSpends();
        const creditCards = storage.getCreditCards();

        const currentDate = new Date();
        const monthlyTransactions = allTransactions.filter(t => isSameMonth(new Date(t.date), currentDate));

        let liquidIncome = 0;
        let liquidExpenses = 0;

        monthlyTransactions.forEach((t) => {
          if (t.is_pending) return;
          if (t.type === 'income') liquidIncome += t.amount;
          else liquidExpenses += t.amount;
        });

        const accountsWithBalance = accounts.map((acc) => {
          let accBalance = 0;
          allTransactions.forEach((t) => {
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

          allTransactions.forEach(t => {
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
            name: format(date, 'EEE'),
            fullDate: format(date, 'MMM dd'),
            income: dIncome,
            expense: dExpense
          };
        });

        // Monthly outflow = liquid expenses only (credit card spends excluded)
        const savingsRate = liquidIncome > 0 ? ((liquidIncome - liquidExpenses) / liquidIncome) * 100 : 0;

        setStats({
          balance: accountsWithBalance.reduce((sum, acc) => sum + acc.balance, 0),
          income: liquidIncome,
          expenses: liquidExpenses,
          savingsRate: Math.max(0, savingsRate),
          transactions: monthlyTransactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
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

  const metricCards = [
    {
      label: "Liquid Cash",
      value: stats.balance,
      icon: Wallet,
      color: "text-emerald-400",
      glow: "glow-emerald",
      prefix: "₹"
    },
    {
      label: "Credit Card Bill",
      value: stats.creditDebt,
      icon: CreditCard,
      color: "text-orange-400",
      glow: "glow-orange",
      prefix: "₹"
    },
    {
      label: "Monthly Inflow",
      value: stats.income,
      icon: TrendingUp,
      color: "text-white",
      glow: "",
      prefix: "₹"
    },
    {
      label: "Monthly Outflow",
      value: stats.expenses,
      icon: TrendingDown,
      color: "text-red-400",
      glow: "glow-red",
      prefix: "₹"
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-xl px-4 py-3 shadow-2xl border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">{payload[0]?.payload?.fullDate}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${entry.dataKey === 'income' ? 'bg-blue-400' : 'bg-red-400'}`} />
            <span className="text-white/60 capitalize">{entry.dataKey}:</span>
            <span className="font-bold text-white">₹{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Your financial overview at a glance.</p>
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
          {metricCards.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className={`relative glass p-6 rounded-[1.5rem] border-white/5 shadow-xl overflow-hidden group hover:border-white/10 transition-all duration-500 ${metric.glow}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <metric.icon className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color} opacity-60`} />
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{metric.label}</p>
                </div>
                <h3 className={`text-3xl font-black ${metric.color}`}>
                  {metric.prefix}{metric.value.toLocaleString()}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cash Velocity Chart */}
          <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-[1.5rem] lg:col-span-2 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold">Cash Velocity</h3>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Income</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Expense</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                    tickFormatter={(v) => v > 0 ? `₹${(v / 1000).toFixed(0)}k` : '0'}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#60a5fa" fill="url(#incomeGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#60a5fa', stroke: 'rgba(96,165,250,0.3)', strokeWidth: 6 }} />
                  <Area type="monotone" dataKey="expense" stroke="#f87171" fill="url(#expenseGrad)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3, fill: '#f87171' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Pulse */}
          <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-[1.5rem] border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Pulse</h3>
              <Link href="/transactions" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All →</Link>
            </div>
            <div className="space-y-3">
              {stats.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'expense' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {tx.type === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[120px]">{tx.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold tabular-nums ${tx.type === 'expense' ? 'text-white/80' : 'text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
              {stats.transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
                  <CircleDollarSign className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-sm font-medium">No transactions yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
