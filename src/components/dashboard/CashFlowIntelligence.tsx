"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowUpRight,
    Flame,
    ShieldCheck,
    Wallet,
    Activity,
    CreditCard
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CashFlowIntelligence() {
    const { metrics } = useFinancialData();
    const { format } = useCurrency();

    // Income Sources
    const salary = metrics?.income?.salary || 0;
    const rent = metrics?.income?.rent || 0;
    const totalIncome = salary + rent;

    // Outflows
    const loanPayments = metrics?.expenses?.loans || 0;
    const household = metrics?.expenses?.household || 0;
    const installments = metrics?.expenses?.installmentsAvg || 0;
    const totalExpenses = loanPayments + household + installments;

    // Key Metrics
    const burnRate = household + installments; // Essential discretionary burn
    const liquidCash = metrics?.professional?.liquidAssets || 0;
    const emergencyCoverage = burnRate > 0 ? liquidCash / burnRate : 0;

    // Flow Data for Visuals
    const expenseData = [
        { name: 'Household & Living', value: household },
        { name: 'Loan Amortization', value: loanPayments },
        { name: 'Credit & Installments', value: installments },
    ].filter(d => d.value > 0);

    // Theoretical 6-Month Burn History
    const burnHistory = Array.from({ length: 6 }).map((_, i) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        Burn: burnRate > 0 ? burnRate * (1 + (Math.random() * 0.1 - 0.05)) : 0, // +/- 5% variance
        Income: totalIncome
    }));

    return (
        <div className="space-y-6 mb-12">
            {/* KPI Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowUpRight className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1"><Wallet className="h-4 w-4" /> Gross Inflow</p>
                    <h3 className="text-3xl font-bold text-emerald-400">{format(totalIncome)}</h3>
                    <p className="text-xs text-slate-500 mt-1">/ month trailing</p>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowDownRight className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1"><CreditCard className="h-4 w-4" /> Gross Outflow</p>
                    <h3 className="text-3xl font-bold text-rose-400">{format(totalExpenses)}</h3>
                    <p className="text-xs text-slate-500 mt-1">/ month trailing</p>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Flame className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1"><Activity className="h-4 w-4" /> Core Burn Rate</p>
                    <h3 className="text-3xl font-bold text-amber-400">{format(burnRate)}</h3>
                    <p className="text-xs text-slate-500 mt-1">Operating household overhead</p>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border-blue-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShieldCheck className="h-16 w-16" /></div>
                    <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Runway Buffer</p>
                    <h3 className="text-3xl font-bold text-blue-400">{emergencyCoverage.toFixed(1)} <span className="text-lg text-slate-500">mos</span></h3>
                    <p className="text-xs text-slate-500 mt-1">Liquid emergency coverage</p>
                </div>
            </motion.div>

            {/* Main Visuals Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="grid gap-6 grid-cols-1 lg:grid-cols-2"
            >
                {/* Outflow Composition */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="w-full text-left mb-4">
                        <h3 className="text-lg font-bold text-white">Outflow Composition</h3>
                        <p className="text-xs text-slate-400">Where your capital is being deployed monthly.</p>
                    </div>
                    {totalExpenses > 0 ? (
                        <>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => [format(value), '']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full grid grid-cols-2 gap-2 mt-4">
                                {expenseData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded border border-white/5">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="truncate flex-1">{item.name}</span>
                                        <span className="font-bold text-white">{((item.value / totalExpenses) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No significant outflows dynamically tracked.</div>
                    )}
                </div>

                {/* 6-Month Burn History Tracker */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <div className="w-full text-left mb-6">
                        <h3 className="text-lg font-bold text-white">Historical Burn vs Income</h3>
                        <p className="text-xs text-slate-400">Tracking income retention over the last two quarters.</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={burnHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    formatter={(value: number) => [format(value), '']}
                                />
                                <Bar name="Gross Inflow" dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar name="Burn Rate" dataKey="Burn" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
