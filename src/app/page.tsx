"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, Target, Activity, Plus, CreditCard, Landmark, Banknote } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useModal } from "@/lib/ModalContext";
import { storage, Transaction, Account } from "@/lib/storage";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import HeroVisual from "@/components/visuals/HeroVisual";
import StorySection from "@/components/landing/StorySection";
import MorphCard from "@/components/motion/MorphCard";
import Magnetic from "@/components/motion/Magnetic";

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

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Credit Card': return <CreditCard className="w-4 h-4" />;
      case 'Bank': return <Landmark className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center">
        <HeroVisual />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="z-10"
        >
          <h1 className="text-8xl font-black tracking-tighter text-luxury mb-6">
            CLARITY
          </h1>
          <p className="text-xl text-dim max-w-lg mx-auto mb-10">
            A spatial environment for hyper-precision financial orchestration.
          </p>
          <div className="flex gap-4 justify-center">
            <Magnetic>
              <button
                onClick={() => openModal("add-expense")}
                className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Pulse Transaction
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => openModal("add-income")}
                className="px-10 py-4 glass text-white font-bold rounded-full hover:scale-105 transition-transform"
              >
                Infuse Capital
              </button>
            </Magnetic>
          </div>
        </motion.div>
      </section>

      {/* Main Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-luxury">Operational Overview</h2>
            <p className="text-dim">Real-time telemetry of your financial assets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.accounts.map((acc) => (
            <motion.div
              key={acc.id}
              variants={itemVariants}
              className="glass p-6 group hover:translate-y-[-4px] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-white/5 text-white/50">
                  {getAccountIcon(acc.type)}
                </div>
                <span className="text-[10px] font-bold text-dim uppercase tracking-widest">{acc.name}</span>
              </div>
              <div className={`text-2xl font-bold ${acc.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                ₹{acc.balance.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="glass p-8 lg:col-span-2 flex flex-col">
            <h3 className="font-bold text-xl mb-8">Liquidity Vector</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#ffffff" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <MorphCard />
          </motion.div>
        </div>
      </motion.div>

      {/* Storytelling Section */}
      <StorySection />

      {/* Footer / CTA */}
      <section className="text-center py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-6xl font-black mb-8">Architect Your Future.</h2>
          <Magnetic>
            <Link href="/analytics" className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full inline-block">
              Open Strategy Engine
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    </div>
  );
}
