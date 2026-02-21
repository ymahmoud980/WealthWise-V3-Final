"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, TrendingUp, ShieldCheck, Lightbulb, Activity } from "lucide-react";

export function SmartInsights() {
    const { metrics, data } = useFinancialData();
    const format = useCurrency();

    // Extract core metrics for analysis
    const cash = metrics?.assets?.cash || 0;
    const debts = metrics?.totalLiabilities || 0;
    const assets = metrics?.totalAssets || 0;

    const leverage = metrics?.professional?.leverageRatio || 0;
    const liquidity = metrics?.professional?.liquidityMonths || 0;
    const netCashFlow = metrics?.operatingCashFlow || 0;
    const totalIncome = metrics?.totalIncome || 1;
    const savingsRate = Math.max(0, (netCashFlow / totalIncome) * 100);

    // 1. Calculate Unified Financial Health Score (0-100)
    let healthScore = 0;
    if (liquidity >= 6) healthScore += 30;
    else if (liquidity >= 3) healthScore += 15;

    if (leverage === 0) healthScore += 30; // Debt free
    else if (leverage < 30) healthScore += 25;
    else if (leverage < 50) healthScore += 10;

    if (savingsRate >= 20) healthScore += 25;
    else if (savingsRate >= 10) healthScore += 10;

    if (assets > 0 && cash / assets > 0.05) healthScore += 15; // Healthy cash buffer

    // 2. Generate AI Insights based on real data
    const insights = [];

    // Insight A: Liquidity Check
    if (liquidity < 3) {
        insights.push({
            type: 'danger',
            icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
            title: "Critical Liquidity Risk",
            description: `Your emergency liquid reserves cover only ${liquidity.toFixed(1)} months of absolute baseline expenses. Target at least 3-6 months.`,
            action: "Pause investments and route cash flow to liquid savings."
        });
    } else if (liquidity > 12) {
        insights.push({
            type: 'warning',
            icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
            title: "Excessive Cash Drag",
            description: `You have ${liquidity.toFixed(1)} months of expenses sitting in liquid cash, losing value to inflation.`,
            action: "Consider deploying excess cash into yielding assets."
        });
    }

    // Insight B: Leverage & Debt
    if (leverage > 60) {
        insights.push({
            type: 'danger',
            icon: <Activity className="h-5 w-5 text-rose-500" />,
            title: "Dangerous Debt Ratio",
            description: `Your liabilities consume ${leverage.toFixed(1)}% of your total asset value. You are highly exposed to market downturns.`,
            action: "Aggressively pay down high-interest liabilities."
        });
    } else if (leverage < 20 && leverage > 0) {
        insights.push({
            type: 'success',
            icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
            title: "Healthy Leverage Profile",
            description: `Your debt profile is extremely safe at ${leverage.toFixed(1)}% of your asset base.`,
            action: "Maintain current debt amortization schedules."
        });
    }

    // Insight C: Savings Rate
    if (savingsRate < 10 && savingsRate > 0) {
        insights.push({
            type: 'warning',
            icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
            title: "Weak Capital Accumulation",
            description: `Your operating cash flow only saves ${savingsRate.toFixed(1)}% of your income. The benchmark for aggressive wealth building is 20%.`,
            action: "Review non-essential household expenses and subscriptions."
        });
    }

    // Fallback Positive if perfectly healthy
    if (insights.length === 0) {
        insights.push({
            type: 'success',
            icon: <BrainCircuit className="h-5 w-5 text-primary" />,
            title: "Optimal Portfolio Efficiency",
            description: "Your liquidity, debt exposure, and capital accumulation metrics are all operating at peak baseline efficiency.",
            action: "No immediate structural changes recommended."
        });
    }

    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 50) return "text-amber-400";
        return "text-rose-500";
    };

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'danger': return 'bg-rose-500/10 border-rose-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" /> Smart Insights Engine
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Autonomous portfolio analysis and health scoring.</p>
                </div>

                {/* Unified Health Score Badge */}
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Health Score</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold tracking-tighter ${getHealthColor(healthScore)}`}>{Math.round(healthScore)}</span>
                        <span className="text-sm font-medium text-slate-500">/ 100</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mt-6">
                {insights.slice(0, 3).map((insight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border flex gap-4 items-start ${getInsightStyle(insight.type)}`}
                    >
                        <div className="p-2 bg-black/40 rounded-lg shrink-0">
                            {insight.icon}
                        </div>
                        <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
                            <div className="mt-2 pt-2 border-t border-white/5">
                                <p className="text-[10px] font-semibold tracking-wider uppercase text-primary">Recommendation</p>
                                <p className="text-xs text-slate-400 mt-0.5">{insight.action}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
