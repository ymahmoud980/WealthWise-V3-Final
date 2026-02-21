"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle, Download, BrainCircuit, ActivitySquare, HeartPulse } from "lucide-react";
import { useRef } from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";
import CountUp from "react-countup";

export default function FinancialHealthV3() {
    const { metrics } = useFinancialData();
    const { format } = useCurrency();
    const reportRef = useRef<HTMLDivElement>(null);

    // 1. BENCHMARKS & RATIOS
    const liquidityRatio = metrics.totalLiabilities > 0 ? (metrics.assets.cash / metrics.totalLiabilities) * 100 : 100;
    const debtToAssetRatio = metrics.totalAssets > 0 ? (metrics.totalLiabilities / metrics.totalAssets) * 100 : 0;
    const savingsRate = metrics.totalIncome > 0 ? (metrics.netCashFlow / metrics.totalIncome) * 100 : 0;

    const monthlyExpenses = metrics.expenses?.household! + metrics.expenses?.loans! + metrics.expenses?.installmentsAvg!;
    // Runway in months (Stress Test) -> If income drops to 0, how long does cash last?
    const runwayMonths = monthlyExpenses > 0 ? metrics.assets.cash / monthlyExpenses : 999;

    // 2. SCORE CALCULATION
    let healthScore = 100;
    if (debtToAssetRatio > 50) healthScore -= 20;
    if (debtToAssetRatio > 70) healthScore -= 20; // Critical level
    if (savingsRate < 20) healthScore -= 10;      // Target is 20%
    if (savingsRate < 0) healthScore -= 20;       // Negative is bad
    if (liquidityRatio < 10) healthScore -= 15;
    healthScore = Math.max(0, healthScore);

    // Visualization Data Arrays
    const scoreData = [
        { name: "Max Score", value: 100, fill: "#ffffff0a" },
        { name: "Current Health", value: healthScore, fill: healthScore > 70 ? "#10b981" : healthScore > 40 ? "#f59e0b" : "#f43f5e" }
    ];

    return (
        <div className="w-full space-y-8 pb-32" ref={reportRef}>

            {/* Dynamic Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
                        Financial Health Engine
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-emerald-400" /> Real-time structural resilience diagnostics.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Core Score (Bento Span 1) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="bento-card p-8 flex flex-col items-center justify-center text-center group"
                >
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase w-full text-left mb-4">Core System Rating</h3>
                    <div className="h-[200px] w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={scoreData} startAngle={180} endAngle={0}>
                                <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
                            <h2 className={`text-6xl font-black ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                <CountUp end={healthScore} duration={2} />
                            </h2>
                            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">/ 100</span>
                        </div>
                    </div>
                    <p className={`mt-2 font-bold text-sm ${healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {healthScore > 80 ? "EXCELLENT CONDITION" : healthScore > 50 ? "STABLE BUT VULNERABLE" : "CRITICAL RISK IDENTIFIED"}
                    </p>
                </motion.div>

                {/* Deep Analytics Arrays (Span 2) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="bento-card lg:col-span-2 p-8 flex flex-col justify-between"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-blue-400" /> Diagnostic Metrics</h3>
                        <p className="text-xs text-slate-400 mt-1">Key structural ratios defining absolute resilience.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Debt Ratio */}
                        <div>
                            <div className="flex justify-between text-sm text-white mb-2">
                                <span className="font-bold text-slate-300">Debt to Asset Ratio</span>
                                <span className="font-bold">{debtToAssetRatio.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, debtToAssetRatio)}%` }} transition={{ duration: 1, delay: 0.5 }}
                                    className={`h-full rounded-full ${debtToAssetRatio > 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 text-right mt-1 font-mono">Limit: &lt;50%</p>
                        </div>

                        {/* Savings Rate */}
                        <div>
                            <div className="flex justify-between text-sm text-white mb-2">
                                <span className="font-bold text-slate-300">Net Savings Rate</span>
                                <span className="font-bold">{savingsRate.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} transition={{ duration: 1, delay: 0.6 }}
                                    className={`h-full rounded-full ${savingsRate < 20 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 text-right mt-1 font-mono">Optimal: &gt;20%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Extreme Stress Test (Span Full) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="bento-card lg:col-span-3 p-8"
                >
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white flex gap-2 items-center"><AlertTriangle className="h-5 w-5 text-amber-500" /> Income Shock Simulation</h3>
                            <p className="text-sm text-slate-400 mt-1">Assumes 100% loss of active income. Calculating structural liquidity runway.</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm font-black border ${runwayMonths < 3 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : runwayMonths < 6 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                            {runwayMonths < 900 ? <CountUp end={runwayMonths} decimals={1} duration={2} suffix=" MONTHS RUNWAY" /> : 'INFINITE RUNWAY'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                            <p className="text-xs font-bold text-slate-500 uppercase">Emergency Liquid Capital (Cash)</p>
                            <h4 className="text-2xl font-black text-cyan-400 mt-1">{format(metrics.assets.cash)}</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                            <p className="text-xs font-bold text-slate-500 uppercase">Absolute Minimum Burn Rate</p>
                            <h4 className="text-2xl font-black text-rose-400 mt-1">{format(monthlyExpenses)} <span className="text-sm font-medium text-slate-500">/ mo</span></h4>
                        </div>
                    </div>

                    {/* AI Insight Flags */}
                    <div className="mt-6 space-y-3">
                        {runwayMonths < 3 && (
                            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-900/40 to-black border-l-4 border-rose-500 text-rose-200 text-sm">
                                <strong>Critical Liquidity Risk:</strong> Your Emergency Fund covers less than 3 months of strict liabilities. Liquidate non-essential assets immediately.
                            </div>
                        )}
                        {debtToAssetRatio > 50 && (
                            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-900/40 to-black border-l-4 border-amber-500 text-amber-200 text-sm">
                                <strong>Leverage Warning:</strong> Over 50% of your wealth is financed by debt. Accelerate principal paydown sequences.
                            </div>
                        )}
                        {runwayMonths >= 6 && debtToAssetRatio <= 50 && savingsRate >= 20 && (
                            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-900/40 to-black border-l-4 border-emerald-500 text-emerald-200 text-sm">
                                <strong>All Systems Nominal:</strong> Fortified capital structure detected. High resistance to market shocks.
                            </div>
                        )}
                    </div>

                </motion.div>

            </div>
        </div>
    );
}