"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Wallet,
    ShieldAlert,
    PiggyBank,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    PieChart
} from "lucide-react";

export function ExecutiveOverview() {
    const { metrics } = useFinancialData();
    const { format } = useCurrency();

    const netWorth = metrics?.netWorth || 0;
    const assets = metrics?.totalAssets || 0;
    const debt = metrics?.totalLiabilities || 0;
    const cashFlow = metrics?.operatingCashFlow || 0;

    const totalIncome = metrics?.totalIncome || 1; // Prevent division by zero
    const savingsRate = Math.max(0, (cashFlow / totalIncome) * 100);

    const leverage = metrics?.professional?.leverageRatio || 0;
    const liquidity = metrics?.professional?.liquidityMonths || 0;

    // Theoretical Risk Score (0-100, lower is better)
    // Higher leverage = higher risk. Lower liquidity = higher risk.
    const riskScore = Math.min(100, Math.max(0, (leverage * 0.6) + (liquidity < 6 ? (6 - liquidity) * 5 : 0)));

    const getRiskColor = (score: number) => {
        if (score < 30) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (score < 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    };

    const getRiskStatus = (score: number) => {
        if (score < 30) return "Healthy";
        if (score < 60) return "Moderate";
        return "High Risk";
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Executive Overview
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Worth */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-5 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Net Worth</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{format(netWorth)}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +2.4% vs last month
                    </div>
                </motion.div>

                {/* Operating Cash Flow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-5 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Operating Cash Flow</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{format(cashFlow)}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                        <TrendingUp className="h-3 w-3 mr-1" /> Highly Liquid
                    </div>
                </motion.div>

                {/* Assets & Liabilities Split */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><PieChart className="h-16 w-16" /></div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-medium text-slate-400">Total Assets</p>
                            <p className="text-sm font-bold text-emerald-400">{format(assets)}</p>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-medium text-slate-400">Total Debt</p>
                            <p className="text-sm font-bold text-rose-400">{format(debt)}</p>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, leverage)}%` }} />
                        </div>
                    </div>
                </motion.div>

                {/* Risk & Performance Matrix */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-5 rounded-2xl flex flex-col justify-between"
                >
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col justify-between">
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Risk Score</p>
                            <div>
                                <h4 className="text-2xl font-bold text-white">{Math.round(riskScore)}<span className="text-xs text-slate-500">/100</span></h4>
                                <div className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit border ${getRiskColor(riskScore)}`}>
                                    {getRiskStatus(riskScore)}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between border-l border-white/10 pl-4">
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1"><PiggyBank className="h-3 w-3" /> Savings Rate</p>
                            <div>
                                <h4 className="text-2xl font-bold text-white">{savingsRate.toFixed(1)}%</h4>
                                <div className="mt-1 text-[10px] font-bold text-emerald-400 flex items-center">
                                    <ArrowUpRight className="h-3 w-3 mr-1" /> Target: 20%
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
