"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { Activity, ShieldAlert, TrendingUp, HelpCircle, Layers, Zap } from "lucide-react";
import { useState } from "react";
import { SmartInsights } from "@/components/dashboard/SmartInsights";
import { InvestmentModule } from "@/components/dashboard/InvestmentModule";

export default function V3AnalyticsPage() {
    const { metrics } = useFinancialData();
    const { format } = useCurrency();
    const [forecastMonths, setForecastMonths] = useState(12);
    const [scenario, setScenario] = useState<"base" | "bull" | "bear">("base");

    // Dynamic Calculations
    const currentNetWorth = metrics?.netWorth || 100000;
    const baseCashFlow = metrics?.operatingCashFlow || 5000;

    const generateForecast = (months: number, trendMultiplier: number) => {
        let data = [];
        let runningWorth = currentNetWorth;
        for (let i = 0; i <= months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            let monthlyGrowth = baseCashFlow * trendMultiplier;
            runningWorth += monthlyGrowth;
            data.push({
                name: monthLabel,
                "Net Worth": runningWorth,
                "Baseline": currentNetWorth + (baseCashFlow * i)
            });
        }
        return data;
    };

    const scenarioMultipliers = { base: 1.0, bull: 1.25, bear: 0.6 };
    const forecastData = generateForecast(forecastMonths, scenarioMultipliers[scenario]);

    const riskData = [
        { subject: 'Market Volatility', A: 80, fullMark: 100 },
        { subject: 'Concentration', A: 45, fullMark: 100 },
        { subject: 'Liquidity', A: 30, fullMark: 100 },
        { subject: 'Inflation', A: 60, fullMark: 100 },
        { subject: 'Interest Rate', A: 55, fullMark: 100 },
        { subject: 'Credit Default', A: 20, fullMark: 100 },
    ];

    const budgetData = [
        { name: 'Core Housing', Actual: 2400, Target: 2000 },
        { name: 'Transport', Actual: 600, Target: 500 },
        { name: 'Food', Actual: 1100, Target: 800 },
        { name: 'Utilities', Actual: 450, Target: 400 },
        { name: 'Discretionary', Actual: 1500, Target: 1000 },
    ];

    return (
        <div className="w-full space-y-8 pb-32">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
                        Advanced Analytics
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-400" /> Deep structural modeling and risk exposure metrics.
                    </p>
                </div>
            </motion.div>

            {/* Smart Insights AI Module */}
            <SmartInsights />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

                {/* Scenario Simulator (Span 2) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="bento-card lg:col-span-2 p-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="h-5 w-5 text-blue-400" /> Scenario Simulator</h3>
                            <p className="text-sm text-slate-400">Monte-Carlo style cash flow projections.</p>
                        </div>

                        <div className="flex bg-black/50 p-1 rounded-xl border border-white/5 mt-4 sm:mt-0 backdrop-blur-md">
                            <button onClick={() => setScenario('bear')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${scenario === 'bear' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-slate-400 hover:text-white'}`}>Stress</button>
                            <button onClick={() => setScenario('base')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${scenario === 'base' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:text-white'}`}>Base</button>
                            <button onClick={() => setScenario('bull')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${scenario === 'bull' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-white'}`}>Bull</button>
                        </div>
                    </div>

                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={scenario === 'bear' ? '#f43f5e' : scenario === 'bull' ? '#10b981' : '#3b82f6'} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={scenario === 'bear' ? '#f43f5e' : scenario === 'bull' ? '#10b981' : '#3b82f6'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    formatter={(value: number) => [format(value), 'Projected']}
                                />
                                <Area type="monotone" dataKey="Net Worth" stroke={scenario === 'bear' ? '#f43f5e' : scenario === 'bull' ? '#10b981' : '#3b82f6'} strokeWidth={3} fillOpacity={1} fill="url(#colorWorth)" />
                                <Line type="monotone" dataKey="Baseline" stroke="#ffffff30" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Risk Exposure Radar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="bento-card p-8 flex flex-col"
                >
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-400" /> Risk Radar</h3>
                        <p className="text-xs text-slate-400 mt-1">Multi-vector exposure map.</p>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
                                <PolarGrid stroke="#ffffff15" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Exposure" dataKey="A" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.3} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Budget Variance Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="bento-card lg:col-span-3 p-8 mt-4"
                >
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">Budget Variance Engine</h3>
                            <p className="text-sm text-slate-400">Actual trailing spend vs Systemic Target.</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                <Bar dataKey="Actual" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="Target" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Embedded V3 Investment Module */}
                <div className="lg:col-span-3 mt-4">
                    <InvestmentModule />
                </div>

            </div>
        </div>
    );
}
