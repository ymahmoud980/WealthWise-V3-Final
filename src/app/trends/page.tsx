"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { useCurrency } from "@/hooks/use-currency";
import { format as formatDate, parseISO } from 'date-fns';
import { Camera, TrendingUp, Zap, ActivitySquare, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function V3TrendsPage() {
  const { data, setData, metrics } = useFinancialData();
  const { format } = useCurrency();
  const [isSaving, setIsSaving] = useState(false);

  // 1. SAVE SNAPSHOT FUNCTION
  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    try {
      const newEntry = {
        date: new Date().toISOString(),
        netWorth: metrics.netWorth,
        totalAssets: metrics.totalAssets,
        totalLiabilities: metrics.totalLiabilities
      };

      const updatedData = {
        ...data,
        history: [...(data.history || []), newEntry]
      };

      setData(updatedData);
      // Small delay purely for the visual button loading state
      setTimeout(() => setIsSaving(false), 800);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  // 2. DATA PREPARATION FOR ADVANCED CHARTING
  const sortedHistory = useMemo(() => {
    return (data.history || [])
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.history]);

  // Map absolute values
  const baseChartData = sortedHistory.map((entry, index, array) => {
    const prevEntry = index > 0 ? array[index - 1] : entry;

    // Calculate Velocity (Rate of Change vs previous snapshot)
    const velocity = entry.netWorth - prevEntry.netWorth;
    const wealthGap = entry.totalAssets - entry.totalLiabilities;

    return {
      date: formatDate(parseISO(entry.date), 'MMM d, yyyy'),
      shortDate: formatDate(parseISO(entry.date), 'MMM d'),
      "Net Worth": entry.netWorth,
      "Assets": entry.totalAssets,
      "Liabilities": entry.totalLiabilities,
      "Velocity": velocity,
      "Wealth Gap": wealthGap,
      // Simulated Market Index (SP500 proxy for visual correlation)
      "Market Index": entry.netWorth * 0.85 + (Math.random() * (entry.netWorth * 0.1))
    };
  });

  const currentVelocity = baseChartData.length > 1 ? baseChartData[baseChartData.length - 1]["Velocity"] : 0;
  const currentGap = baseChartData.length > 0 ? baseChartData[baseChartData.length - 1]["Wealth Gap"] : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-black/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="font-bold text-white mb-3 text-sm">{label}</p>
          {payload.map((pld: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center gap-6 mb-1">
              <span className="text-xs font-medium text-slate-400">{pld.name}</span>
              <span style={{ color: pld.color }} className="text-sm font-bold font-mono">
                {pld.name === 'Velocity' ? (pld.value > 0 ? '+' : '') : ''}{format(pld.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8 pb-32">

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
            Macro-Economic Velocity
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" /> Complex algorithmic tracking of wealth acceleration over time.
          </p>
        </div>

        <Button
          onClick={handleSaveSnapshot}
          disabled={isSaving}
          className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 text-blue-300 hover:text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          <Camera className="mr-2 h-4 w-4" />
          {isSaving ? "Locking Snapshot..." : "Record Current State"}
        </Button>
      </motion.div>

      {baseChartData.length < 2 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
            <ServerCrash className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Insufficient Trajectory Data</h2>
          <p className="text-slate-400 max-w-md">
            The Velocity Engine requires at least two historical snapshots to calculate mathematical rate-of-change. Click <strong>Record Current State</strong> above to establish your baseline matrix.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Velocity KPI (Span 1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bento-card p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Net Worth Velocity</p>
                <p className="text-[10px] text-slate-500 mt-1">Snapshot-over-Snapshot Delta</p>
              </div>
              <div className={`p-2 rounded-lg ${currentVelocity >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <TrendingUp className={`h-5 w-5 ${currentVelocity < 0 && 'rotate-180'}`} />
              </div>
            </div>
            <div className="mt-8">
              <h2 className={`text-4xl lg:text-5xl font-black tracking-tighter ${currentVelocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentVelocity > 0 ? '+' : ''}
                <CountUp end={currentVelocity} duration={2} separator="," prefix="$" />
              </h2>
            </div>
          </motion.div>

          {/* Absolute Wealth Gap (Span 2) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bento-card lg:col-span-2 p-6 flex flex-col justify-between"
          >
            <div className="mb-4">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">The Wealth Gap</p>
              <p className="text-xs text-slate-500 mt-1">Absolute divergence between Assets and Liabilities.</p>
            </div>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={baseChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="shortDate" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="Wealth Gap" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorGap)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Master Trajectory Terminal (Span 3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="bento-card lg:col-span-3 p-8 mt-4"
          >
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><ActivitySquare className="h-5 w-5 text-blue-400" /> Master Trajectory Engine</h3>
                <p className="text-sm text-slate-400 mt-1">Tracking Net Worth against Simulated Macro-Market correlation indices.</p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={baseChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="shortDate" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '10px' }} />

                  {/* Market Correlation line overlayed on Absolute Net Worth Bars */}
                  <Bar yAxisId="left" dataKey="Net Worth" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} fillOpacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="Market Index" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line yAxisId="left" type="stepAfter" dataKey="Liabilities" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}