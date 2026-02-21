"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { BarChart, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function InvestmentModule() {
    const { metrics, data } = useFinancialData();
    const format = useCurrency();

    // Extract metrics
    const totalAssets = metrics?.totalAssets || 0;

    // Theoretical Mock Metrics for V2 Presentation (until historical DB is built)
    const cagr = 8.4; // % Compound Annual Growth Rate
    const volatility = 12.2; // % Annualized Volatility
    const sharpeRatio = 1.65; // Risk-adjusted return
    const maxDrawdown = -14.3; // % Peak-to-trough decline

    const performanceData = [
        { year: "2019", value: totalAssets * 0.6 },
        { year: "2020", value: totalAssets * 0.68 },
        { year: "2021", value: totalAssets * 0.85 },
        { year: "2022", value: totalAssets * 0.79 },
        { year: "2023", value: totalAssets * 0.92 },
        { year: "2024", value: totalAssets },
    ];

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-purple-400" /> Investment Performance
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Institutional-grade portfolio metrics and historical yield tracking.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* CAGR */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><TrendingUp className="h-3 w-3" /> CAGR</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{cagr}%</span>
                        <span className="text-xs text-emerald-400">+1.2%</span>
                    </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity className="h-3 w-3" /> Sharpe</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{sharpeRatio}</span>
                        <span className="text-xs text-slate-500">Risk-Adj</span>
                    </div>
                </div>

                {/* Volatility */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Layers className="h-3 w-3" /> Volatility</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{volatility}%</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded ml-1">Moderate</span>
                    </div>
                </div>

                {/* Max Drawdown */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-rose-500/30 transition-colors">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Drawdown</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-rose-400">{maxDrawdown}%</span>
                        <span className="text-xs text-slate-500">Peak Decline</span>
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [format(value), 'Portfolio Value']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
