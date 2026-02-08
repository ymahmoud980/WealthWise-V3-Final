"use client";

import { useState } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Wallet, Calendar, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { format, addMonths, startOfMonth, isSameMonth } from "date-fns";

export default function OutlookPage() {
  const { data, metrics, currency, rates } = useFinancialData();
  const { format: fmt } = useCurrency();
  
  // --- 1. PREPARE DATA ---
  
  // A. Future Installments (The Liabilities)
  const allObligations: any[] = [];
  const today = new Date();

  data.liabilities.installments.forEach(inst => {
    if (inst.schedule) {
        inst.schedule.forEach(item => {
            const date = new Date(item.date);
            if (date >= today) {
                allObligations.push({
                    date: date,
                    amount: convert(item.amount, inst.currency, currency, rates),
                    name: `${inst.project} (${item.description})`,
                });
            }
        });
    }
  });
  allObligations.sort((a, b) => a.date.getTime() - b.date.getTime());

  // B. The "Engine" Variables
  // 1. Starting Fuel: Only Cash assets (Bank + Wallet). No Gold, No Real Estate.
  const startingLiquidCash = convert(metrics.assets.cash, currency, currency, rates);

  // 2. Monthly Speed: Total Income - (Household + Bank Loans)
  // We DO NOT subtract "InstallmentsAvg" here because we calculate actual installments individually below.
  const monthlyIncome = convert(metrics.totalIncome, currency, currency, rates);
  const monthlyLivingExpenses = convert(metrics.expenses.household + metrics.expenses.loans, currency, currency, rates);
  const monthlyFreeCash = monthlyIncome - monthlyLivingExpenses;

  // --- 2. RUN SIMULATION (24 Months) ---
  const monthlyAnalysis = [];
  let runningBalance = startingLiquidCash;
  let cursor = startOfMonth(today);
  
  for (let i = 0; i < 24; i++) {
      // 1. Add this month's savings
      runningBalance += monthlyFreeCash;

      // 2. Find bills due this specific month
      const monthsBills = allObligations.filter(o => isSameMonth(o.date, cursor));
      const billsTotal = monthsBills.reduce((sum, item) => sum + item.amount, 0);

      // 3. Pay the bills
      runningBalance -= billsTotal;

      monthlyAnalysis.push({
          month: format(cursor, 'MMMM yyyy'),
          startBalance: runningBalance + billsTotal - monthlyFreeCash, // Math to show "Open" balance
          monthlyAdd: monthlyFreeCash,
          bills: monthsBills,
          billsTotal: billsTotal,
          endBalance: runningBalance,
          isShortage: runningBalance < 0
      });

      cursor = addMonths(cursor, 1);
  }

  const firstShortage = monthlyAnalysis.find(m => m.isShortage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      
      {/* HEADER & STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Financial Outlook</h1>
            <p className="text-muted-foreground">Cash Flow Forecast (24 Months)</p>
        </div>
        {firstShortage ? (
             <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-4 text-red-400 w-full md:w-auto">
                <AlertTriangle className="h-8 w-8 shrink-0" />
                <div>
                    <p className="font-bold text-lg">Cash Crunch Predicted</p>
                    <p className="text-sm">Shortage in <span className="underline font-bold">{firstShortage.month}</span>.</p>
                </div>
             </div>
        ) : (
             <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-4 text-emerald-400 w-full md:w-auto">
                <CheckCircle className="h-8 w-8 shrink-0" />
                <div>
                    <p className="font-bold text-lg">Healthy Runway</p>
                    <p className="text-sm">Fully solvent for 2 Years.</p>
                </div>
             </div>
        )}
      </div>

      {/* --- THE FORMULA BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-900/10 border-blue-500/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-400 font-medium">1. Starting Liquid Cash</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-white font-mono">{fmt(startingLiquidCash)}</div>
                  <p className="text-xs text-muted-foreground">Current Cash Holdings</p>
              </CardContent>
          </Card>
          
          <div className="flex justify-center items-center md:hidden"><PlusIcon /></div>

          <Card className="bg-emerald-900/10 border-emerald-500/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400 font-medium">2. Monthly Free Cash</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-white font-mono">+{fmt(monthlyFreeCash)}</div>
                  <p className="text-xs text-muted-foreground">Income - (Living + Loans)</p>
              </CardContent>
          </Card>

          <div className="flex justify-center items-center md:hidden"><ArrowRight className="rotate-90" /></div>

          <Card className={`bg-opacity-10 border-opacity-20 ${firstShortage ? 'bg-red-900 border-red-500' : 'bg-slate-800 border-slate-500'}`}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300 font-medium">3. Forecast Result</CardTitle></CardHeader>
              <CardContent>
                  <div className={`text-2xl font-bold font-mono ${firstShortage ? 'text-red-400' : 'text-slate-200'}`}>
                      {firstShortage ? "Risk Detected" : "Secure"}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on current schedule</p>
              </CardContent>
          </Card>
      </div>

      {/* --- TIMELINE --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Timeline Analysis</h3>
        
        {monthlyAnalysis.map((month, i) => (
            <div key={i} className={`relative p-4 rounded-xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center transition-all ${month.isShortage ? 'bg-red-950/30 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-[#111827] border-white/5'}`}>
                
                {/* Month & Inflow */}
                <div className="flex items-center gap-4 w-full lg:w-1/4">
                    <div className="p-3 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg">{month.month}</p>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Adds {fmt(month.monthlyAdd)}
                        </p>
                    </div>
                </div>

                {/* The Bills */}
                <div className="flex-1 w-full lg:border-l lg:border-r border-white/10 lg:px-6 space-y-2">
                    {month.bills.length > 0 ? (
                        month.bills.map((o: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-black/20 p-2 rounded border border-white/5">
                                <span className="text-slate-300">{o.name}</span>
                                <span className="text-rose-400 font-bold font-mono">-{fmt(o.amount)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-muted-foreground italic py-2 flex items-center gap-2">
                           <CheckCircle className="h-3 w-3 text-emerald-500" /> No project payments due.
                        </div>
                    )}
                </div>

                {/* End Balance */}
                <div className="w-full lg:w-1/5 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Projected Balance</p>
                    <p className={`text-2xl font-bold font-mono ${month.endBalance < 0 ? 'text-red-500' : 'text-white'}`}>
                        {fmt(month.endBalance)}
                    </p>
                </div>

            </div>
        ))}
      </div>
    </div>
  );
}

function PlusIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M12 5v14M5 12h14"/></svg>
}