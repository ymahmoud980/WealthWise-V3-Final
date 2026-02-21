"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    LineChart,
    HeartPulse,
    TrendingUp,
    Banknote,
    Zap,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function IntelligenceGuidePage() {
    return (
        <div className="w-full space-y-12 pb-32">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight flex items-center gap-4">
                        <BookOpen className="h-10 w-10 text-emerald-400" /> V3 Intelligence Guide
                    </h1>
                    <p className="text-slate-400 mt-3 font-medium text-lg leading-relaxed max-w-2xl">
                        Welcome to the advanced terminal manual. Below is a detailed breakdown of how to leverage the specialized analytical engines integrated into the Wealth Navigator.
                    </p>
                </div>
            </motion.div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Cash Flow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="bento-card p-8 group hover:border-blue-500/30 transition-all duration-500"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <Link href="/cashflow" className="flex items-center text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-white transition-colors group">
                            Launch <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Cash Flow Intelligence</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        Calculates real-time capital deployment metrics by pitting gross inflows against fixed and variable outflow burns. It calculates your <span className="text-emerald-400 font-bold">Operating Runway</span> (how long your current liquid capital survives burn rates) and highlights your active savings ratios.
                    </p>
                </motion.div>

                {/* 2. Advanced Analytics */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="bento-card p-8 group hover:border-purple-500/30 transition-all duration-500"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                            <LineChart className="w-6 h-6" />
                        </div>
                        <Link href="/analytics" className="flex items-center text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-white transition-colors group">
                            Launch <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Advanced Analytics</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        A macro visualization engine. Features a <span className="text-purple-400 font-bold">Scenario Simulator</span> that allows you to predict net worth growth at varying market trajectories (Bull, Base, Bear). Also includes an interactive Risk Assessment Radar mapping liquidity safety vs leveraged risk.
                    </p>
                </motion.div>

                {/* 3. Health Diagnostics */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="bento-card p-8 group hover:border-rose-500/30 transition-all duration-500"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <Link href="/health" className="flex items-center text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-white transition-colors group">
                            Launch <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Health Diagnostics</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        Your direct financial immune system. It runs instantaneous algorithmic checks to score your <span className="text-rose-400 font-bold">Debt Stress</span> and <span className="text-rose-400 font-bold">Solvency Status</span>. Importantly, it includes a Severe Shock Simulator to calculate catastrophic job loss survival rates down to the exact month.
                    </p>
                </motion.div>

                {/* 4. Trends / Trajectory */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
                    className="bento-card p-8 group hover:border-amber-500/30 transition-all duration-500"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <Link href="/trends" className="flex items-center text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-white transition-colors group">
                            Launch <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Macro Trends Engine</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        Analyzes the absolute velocity of your wealth accumulation spanning long timeframes. Features the <span className="text-amber-500 font-bold">Wealth Gap Matrix</span>, mapping your aggregated total active liabilities as shaded "underwater" areas sitting below the surface of your total capital pool.
                    </p>
                </motion.div>

            </div>

            {/* Financial Glossary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16"
            >
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-8 border-b border-white/10 pb-4">
                    Glossary of Financial Terminology
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Definitions Array mapped to Cards */}
                    {[
                        { term: "Gross Inflow / Input", def: "The absolute total amount of cash entering your accounts every month before any deductions, taxes, or expenses are removed. This includes your base salary plus all active rental yields." },
                        { term: "Gross Outflow / Burn", def: "The total amount of capital leaving your accounts every month. It is a combination of fixed loan payments, household expenses, and project installments." },
                        { term: "Core Burn Rate", def: "The bare minimum amount of cash you need to survive every month if a catastrophic event occurred (e.g., job loss). It strips away investments and only counts mandatory household expenses and loan survivability." },
                        { term: "Projected Net Flow", def: "The calculated amount of cash left over at the end of the month after *all* obligations (including expensive off-plan property installments) have been paid. If this is red, your current income does not cover your project commitments." },
                        { term: "Actual Monthly Savings", def: "The pure cash flow generated strictly from your salary and household expenses, measured *before* you sink money into long-term real estate projects. It shows your true baseline saving capability." },
                        { term: "Runway Buffer", def: "A survival metric. It measures exactly how many months you can continue paying your bills using only your Emergency Liquid Capital, assuming all sources of income (salary and rent) drop to zero immediately." },
                        { term: "Emergency Liquid Capital", def: "Cash or assets that can be instantly converted to cash within 24 hours without significant loss of value. In this system, it is calculated strictly as Cash in the Bank + Physical Gold Holdings + Physical Silver Holdings." },
                        { term: "Loan Amortization", def: "The process of paying off a debt (like a mortgage) over time through regular payments. A portion of each payment covers the interest, and the rest reduces the principal balance." },
                        { term: "The Wealth Gap", def: "Visible on the Trends page. It is the visual disparity between your Gross Total Assets (everything you own) and your Net Worth (what you own minus what you owe). A widening gap implies taking on debt faster than accumulating assets." },
                        { term: "Macro-Economic Velocity", def: "The speed and angle at which your total Net Worth is growing over long periods of time (years). High velocity means your wealth is compounding rapidly; low or negative velocity implies stagnation or wealth destruction." },
                        { term: "Master Trajectory Engine", def: "The forecasting algorithm on the Trends page. It takes your historical data points and mathematically projects where your Net Worth will be in the future, establishing a baseline trend line." },
                        { term: "Core System Rating", def: "An algorithmic score (0-100) on the Health page that evaluates your overall structural financial safety. It severely penalizes you for having low liquid cash reserves while carrying high amounts of debt." },
                        { term: "Income Shock Simulation", def: "A stress-test found on the Health page. It actively simulates a \"Catastrophic Income Loss\" scenario (e.g., you lose your job today) and calculates exactly how many months you have before bankruptcy." },
                        { term: "Net Savings Rate", def: "The percentage of your Gross Income that you manage to keep instead of spending. A rate of 0% means you live paycheck to paycheck. A rate of 20%+ is considered required for aggressive wealth building." },
                    ].map((item, i) => (
                        <div key={i} className="glass-panel p-6 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                            <h4 className="text-emerald-400 font-bold mb-2">{item.term}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.def}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
