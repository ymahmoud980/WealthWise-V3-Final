"use client";

import { useState, useEffect } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Calendar, TrendingUp, Wallet, Home, ArrowRight } from "lucide-react";
import { format, addMonths, startOfMonth, isSameMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function OutlookPage() {
  const { data, metrics, currency, rates } = useFinancialData();
  const { format: fmt } = useCurrency();
  
  // 1. Get Monthly Free Cash (Calculated in calculations.ts as Salary - Living - Loans)
  const totalMonthlyFree = metrics.operatingCashFlow;
  
  // 2. User Allocation State (Default to Total, but editable)
  const [projectBudget, setProjectBudget] = useState(totalMonthlyFree);

  // Sync state if underlying data changes (e.g. currency switch)
  useEffect(() => {
    // Only reset if the current value is widely off (like 0)
    if (projectBudget === 0) setProjectBudget(totalMonthlyFree);
  }, [totalMonthlyFree]);

  const duplexBudget = totalMonthlyFree - projectBudget;

  // --- 3. PREPARE OBLIGATIONS ---
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

  const startingLiquidCash = convert(metrics.assets.cash, currency, currency, rates);

  // --- 4. RUN SIMULATION (Based on Project Budget) ---
  const monthlyAnalysis = [];
  let runningBalance = startingLiquidCash;
  let cursor = startOfMonth(today);
  
  for (let i = 0; i < 24; i++) {
      // Add the Allocated Budget
      runningBalance += projectBudget;

      const monthsBills = allObligations.filter(o => isSameMonth(o.date, cursor));
      const billsTotal = monthsBills.reduce((sum, item) => sum + item.amount, 0);

      runningBalance -= billsTotal;

      monthlyAnalysis.push({
          month: format(cursor, 'MMMM yyyy'),
          monthlyAdd: projectBudget,
          bills: monthsBills,
          billsTotal: billsTotal,
          endBalance: runningBalance,
          isShortage: runningBalance < 0
      });

      cursor = addMonths(cursor, 1);
  }

  const firstShortage = monthlyAnalysis.find(m => m.isShortage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Financial Outlook</h1>
            <p className="text-muted-foreground">Strategic Allocation Analysis.</p>
        </div>
        
        {firstShortage ? (
             <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-4 text-red-400 w-full md:w-auto">
                <AlertTriangle className="h-8 w-8 shrink-0" />
                <div>
                    <p className="font-bold text-lg">Deficit in {firstShortage.month}</p>
                    <p className="text-sm">Installments exceed the allocated budget.</p>
                </div>
             </div>
        ) : (
             <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-4 text-emerald-400 w-full md:w-auto">
                <CheckCircle className="h-8 w-8 shrink-0" />
                <div>
                    <p className="font-bold text-lg">Strategy is Safe</p>
                    <p className="text-sm">Allocation covers all upcoming installments.</p>
                </div>
             </div>
        )}
      </div>

      {/* --- ALLOCATION CONTROLS --- */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-500">
          <div className="flex flex-col md:flex-row justify-between items-end mb-4">
              <div>
                  <h2 className="text-xl font-bold text-white">Monthly Allocation Strategy</h2>
                  <p className="text-sm text-muted-foreground">Total Free Cash: <span className="text-white font-bold">{fmt(totalMonthlyFree)}</span> (Salary - Living - Loans)</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* INPUT: PROJECT BUDGET */}
              <div className="space-y-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex justify-between"><label className="text-sm font-bold text-blue-400">For Installments</label><Wallet className="h-4 w-4 text-blue-400"/></div>
                  <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        value={Math.round(projectBudget)} 
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if(val <= totalMonthlyFree && val >= 0) setProjectBudget(val);
                        }}
                        className="bg-black/40 border-blue-500/50 text-2xl font-mono text-white h-12"
                    />
                  </div>
                  <p className="text-[10px] text-blue-300/70">Adjust this to test safety</p>
              </div>

              {/* SLIDER */}
              <div className="px-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Projects</span><span>Duplex/Savings</span></div>
                  <Slider value={[projectBudget]} max={totalMonthlyFree} step={10} onValueChange={(val) => setProjectBudget(val[0])} className="cursor-pointer" />
              </div>

              {/* OUTPUT: DUPLEX BUDGET */}
              <div className="space-y-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex justify-between"><label className="text-sm font-bold text-purple-400">For Duplex / Savings</label><Home className="h-4 w-4 text-purple-400"/></div>
                  <div className="text-2xl font-bold text-white font-mono h-12 flex items-center">{fmt(duplexBudget)}</div>
                  <p className="text-[10px] text-purple-300/70">Remaining Balance</p>
              </div>
          </div>
      </div>

      {/* --- TIMELINE --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Cash Flow Timeline</h3>
        
        {monthlyAnalysis.map((month, i) => (
            <div key={i} className={`relative p-4 rounded-xl border flex flex-col lg:flex-row gap-6 items-start lg:items-center transition-all ${month.isShortage ? 'bg-red-950/30 border-red-500/40' : 'bg-[#111827] border-white/5'}`}>
                <div className="flex items-center gap-4 w-full lg:w-1/4">
                    <div className="p-3 rounded-lg bg-white/5 text-slate-300 border border-white/10"><Calendar className="h-6 w-6" /></div>
                    <div><p className="font-bold text-white text-lg">{month.month}</p><p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Adds {fmt(month.monthlyAdd)}</p></div>
                </div>

                <div className="flex-1 w-full lg:border-l lg:border-r border-white/10 lg:px-6 space-y-2">
                    {month.bills.length > 0 ? (
                        month.bills.map((o: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-black/20 p-2 rounded border border-white/5">
                                <span className="text-slate-300">{o.name}</span>
                                <span className="text-rose-400 font-bold font-mono">-{fmt(o.amount)}</span>
                            </div>
                        ))
                    ) : <div className="text-xs text-muted-foreground italic py-2">No installments due.</div>}
                </div>

                <div className="w-full lg:w-1/5 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Project Balance</p>
                    <p className={`text-2xl font-bold font-mono ${month.endBalance < 0 ? 'text-red-500' : 'text-white'}`}>{fmt(month.endBalance)}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}