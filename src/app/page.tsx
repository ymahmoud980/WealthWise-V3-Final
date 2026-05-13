"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { convert } from "@/lib/calculations";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Info,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis } from "recharts";

export default function V3Dashboard() {
  const { data, metrics, loading: isLoading, rates } = useFinancialData();
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
  const emergency = metrics?.emergency;
  const runwayMonths = emergency?.runwayCashMonths || 0;
  const emergencyPct = emergency?.progressPct || 0;
  const monthlyBurn = emergency?.monthlyBurn || 0;
  const savingsRate = metrics?.professional?.savingsRate ?? 0;

  const history = data?.history || [];

  // Parse Real History for Chart - Normalize to Current Currency!
  let sparklineData = [];

  if (history.length > 1) {
    sparklineData = history.map((snap) => {
      // Convert the snapshot's recorded net worth from its recorded currency to the currently selected display currency
      const normalizedValue = convert(snap.netWorth, snap.currency, currency, rates);
      return {
        value: Number(normalizedValue.toFixed(0)), // Round for cleaner tooltip
        date: snap.date, // YYYY-MM-DD
      };
    });
  } else if (history.length === 1) {
    const normalizedValue = convert(history[0].netWorth, history[0].currency, currency, rates);
    sparklineData = [
      { value: Number(normalizedValue.toFixed(0)), date: history[0].date },
      { value: Number(normalizedValue.toFixed(0)), date: "Now" }
    ];
  } else {
    sparklineData = [
      { value: Number(netWorth.toFixed(0)), date: "Start" },
      { value: Number(netWorth.toFixed(0)), date: "Now" }
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

      {/* Critical-status alerts strip */}
      {(runwayMonths < 3 || cashFlow < 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-wrap items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-semibold text-rose-200">
              {cashFlow < 0
                ? "Your monthly cash flow is negative — you are spending more than you earn."
                : `You only have ${runwayMonths.toFixed(1)} months of cash runway. The safe baseline is 6 months.`}
            </p>
            <p className="text-xs text-rose-100/70 mt-0.5">
              Open the <Link href="/statement" className="underline">Statement X-Ray</Link> to identify drains, or go to the{" "}
              <Link href="/emergency" className="underline">Emergency Plan</Link> to build the cushion.
            </p>
          </div>
        </motion.div>
      )}

      {/* V3 Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">

        {/* Core Engine: Net Worth (Spans 2 cols, 2 rows) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bento-card md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div>
              <InfoTooltip
                label="Global Net Worth"
                explanation={<>Basis: <strong>Total Assets &minus; Total Liabilities</strong></>}
                className="text-sm font-bold tracking-widest text-slate-400 uppercase"
              />
              <h2 className="text-5xl md:text-7xl font-black text-white mt-2 tracking-tighter">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : ''}
                <CountUp end={netWorth} separator="," duration={2.5} />
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="h-[120px] w-full -mx-4 -mb-8 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={['auto', 'auto']}
                  hide={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(value) => [new Intl.NumberFormat().format(value as number), currency]}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
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
            <InfoTooltip
              label="Cash Flow"
              explanation={<>Basis: <strong>Salary &minus; (Loan Payments + Household)</strong></>}
            />
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
            <InfoTooltip
              label="Total Assets"
              explanation="Gross value of all holdings, including real estate."
            />
            <h3 className="text-3xl font-bold text-white">
              {format(assets)}
            </h3>
          </div>
        </motion.div>

        {/* Strategic Liquidity (1 col, 1 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bento-card p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <ShieldCheck className="text-purple-400 h-6 w-6" />
          </div>
          <div>
            <InfoTooltip
              label="Liquid Capital"
              explanation={<><strong>Cash + Gold + Silver</strong><br />Excludes hard assets like Real Estate.</>}
            />
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
            <InfoTooltip
              label="Total Debt"
              explanation="Remaining bank loans and unpaid installments."
            />
            <h3 className="text-3xl font-bold text-rose-400">
              {format(debt)}
            </h3>
          </div>
        </motion.div>

        {/* Emergency Fund Progress (Spans 2 cols, 1 row) */}
        <Link href="/emergency" className="md:col-span-2 group">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="bento-card p-6 h-full flex flex-col justify-between cursor-pointer hover:border-emerald-500/30"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <InfoTooltip
                  label="2-Year Emergency Fund"
                  explanation={<>Goal: cash reserve that covers <strong>24 months of essential burn</strong>. Industry baseline is 6, but 24 buys real optionality.</>}
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                {runwayMonths.toFixed(1)} mo runway
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="text-white font-mono text-sm">{emergencyPct.toFixed(1)}%</span>
                <span>target {format(emergency?.target24mo || 0)}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, emergencyPct)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Burn: <span className="text-slate-200 font-mono">{format(monthlyBurn)}/mo</span> · Shortfall:{" "}
                <span className={`font-mono ${(emergency?.shortfall24mo ?? 0) > 0 ? "text-rose-300" : "text-emerald-300"}`}>
                  {format(emergency?.shortfall24mo || 0)}
                </span>
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Savings Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.7 }}
          className="bento-card p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <Sparkles className="text-amber-400 h-6 w-6" />
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              savingsRate >= 20 ? "bg-emerald-500/20 text-emerald-300" :
              savingsRate >= 5  ? "bg-amber-500/20 text-amber-300" :
                                  "bg-rose-500/20 text-rose-300"
            }`}>
              {savingsRate >= 20 ? "Excellent" : savingsRate >= 5 ? "Adequate" : "Critical"}
            </div>
          </div>
          <div>
            <InfoTooltip
              label="Savings Rate"
              explanation={<>Operating cash flow as % of total income. Aim for <strong>≥ 20%</strong>.</>}
            />
            <h3 className="text-3xl font-bold text-amber-300">
              {savingsRate.toFixed(1)}%
            </h3>
          </div>
        </motion.div>

      </div>

      {/* Upcoming Obligations & Real Estate Rents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bento-card p-6 min-h-[400px]">
          <UpcomingPayments />
        </div>
        <div className="bento-card p-6 min-h-[400px]">
          <UpcomingRents rents={data?.assets?.realEstate || []} />
        </div>
      </div>

      {/* Quick-action strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Link href="/statement" className="bento-card p-6 group hover:border-emerald-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Run a Statement X-Ray</p>
              <p className="text-xs text-slate-400">Upload a bank statement and let AI find your money drains.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
        <Link href="/emergency" className="bento-card p-6 group hover:border-cyan-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Plan your 2-Year Emergency Fund</p>
              <p className="text-xs text-slate-400">5-tier ladder + projected completion date at your current savings rate.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
      </div>

    </div>
  );
}