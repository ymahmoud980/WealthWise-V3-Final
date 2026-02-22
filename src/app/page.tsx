"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
export default function V3Dashboard() {
  const { metrics, isLoading, rates } = useFinancialData();
  const { format, currency, setCurrency } = useCurrency();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const netWorth = metrics?.netWorth || 0;
  const assets = metrics?.totalAssets || 0;
  const debt = metrics?.totalLiabilities || 0;
  const cashFlow = metrics?.operatingCashFlow || 0;
  const liquidity = metrics?.professional?.liquidAssets || 0;

  const { data } = useFinancialData();
  const history = data?.history || [];

  // Parse Real History for Chart
  let sparklineData = [];

  if (history.length > 1) {
    sparklineData = history.map((snap) => ({
      value: snap.netWorth,
      date: snap.date, // useful for tooltips later if needed
    }));
  } else if (history.length === 1) {
    // If only one data point exists, draw a flat line so the chart doesn't break
    sparklineData = [
      { value: history[0].netWorth, date: history[0].date },
      { value: history[0].netWorth, date: "Now" }
    ];
  } else {
    // Fallback if absolutely no history exists yet
    sparklineData = [
      { value: netWorth, date: "Start" },
      { value: netWorth, date: "Now" }
    ];
  }

  return (
    <div className="w-full space-y-6 pb-20">

      {/* Dynamic Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Commander'}
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" /> Systems nominal. Wealth Engine active.
          </p>
        </div>

        {/* Currency & Market Ticker UI */}
        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Currency Override:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold py-1.5 px-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors w-full sm:w-auto hover:bg-emerald-500/20 cursor-pointer"
            >
              <option className="bg-slate-900" value="USD">USD</option>
              <option className="bg-slate-900" value="EUR">EUR</option>
              <option className="bg-slate-900" value="GBP">GBP</option>
              <option className="bg-slate-900" value="KWD">KWD</option>
              <option className="bg-slate-900" value="EGP">EGP</option>
              <option className="bg-slate-900" value="AED">AED</option>
              <option className="bg-slate-900" value="SAR">SAR</option>
              <option className="bg-slate-900" value="TRY">TRY</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs font-mono font-bold w-full md:w-auto">
            <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">EUR: {(rates?.EUR || 0.95).toFixed(2)}</span>
            <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">GOLD: ${(rates?.Gold || 0).toFixed(2)}/oz</span>
            <span className="text-slate-300 bg-slate-500/10 px-2.5 py-1 rounded border border-slate-500/20">SILV: ${(rates?.Silver || 0).toFixed(2)}/oz</span>
          </div>
        </div>
      </motion.div>

      {/* V3 Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">

        {/* Core Engine: Net Worth (Spans 2 cols, 2 rows) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bento-card md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Global Net Worth</p>
              <h2 className="text-5xl md:text-7xl font-black text-white mt-2 tracking-tighter">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : ''}
                <CountUp end={netWorth} separator="," duration={2.5} />
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="h-[120px] w-full -mx-4 -mb-8 mt-4 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Operating Cash Flow (Spans 1 col, 1 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bento-card p-6 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <Activity className="text-blue-400 h-6 w-6" />
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> Monthly
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Cash Flow</p>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
              <CountUp end={cashFlow} separator="," duration={2.5} prefix={currency === 'USD' ? '$' : ''} />
            </h3>
          </div>
        </motion.div>

        {/* Total Assets (Spans 1 col, 1 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bento-card p-6 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <TrendingUp className="text-emerald-400 h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Assets</p>
            <h3 className="text-3xl font-bold text-white">
              {format(assets)}
            </h3>
          </div>
        </motion.div>

        {/* Strategic Liquidity (1 col, 1 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bento-card p-6 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <ShieldCheck className="text-purple-400 h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Liquid Capital</p>
            <h3 className="text-3xl font-bold text-white">
              {format(liquidity)}
            </h3>
          </div>
        </motion.div>

        {/* Liabilities & Risk (1 col, 1 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="bento-card p-6 flex flex-col justify-between border-rose-500/20 group"
        >
          <div className="flex justify-between items-start">
            <TrendingDown className="text-rose-400 h-6 w-6" />
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${debt > assets ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {debt > assets ? 'High Leverage' : 'Healthy Ratio'}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Debt</p>
            <h3 className="text-3xl font-bold text-rose-400">
              {format(debt)}
            </h3>
          </div>
        </motion.div>

      </div>

    </div>
  );
}