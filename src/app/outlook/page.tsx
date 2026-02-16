
"use client";

import { useState, useEffect, useMemo } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { convert, calculateMetrics } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Calendar, TrendingUp, Wallet, Home, Coins, RotateCcw } from "lucide-react";
import { format as formatDate, addMonths, startOfMonth, isSameMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function OutlookPage() {
  const { data, currency, rates } = useFinancialData();
  const { format: fmt } = useCurrency();
  
  // 1. CALCULATE LIVE DEFAULTS IN KWD
  const { realLiquidCashInKWD, totalMonthlyFreeInKWD } = useMemo(() => {
    const kwdMetrics = calculateMetrics(data, 'KWD', rates);
    return {
        realLiquidCashInKWD: kwdMetrics.assets.cash,
        totalMonthlyFreeInKWD: kwdMetrics.operatingCashFlow
    };
  }, [data, rates]);

  // 2. STATE in KWD
  const [projectBudgetInKWD, setProjectBudgetInKWD] = useState(0);
  const [startingCashInKWD, setStartingCashInKWD] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. LOAD STRATEGY (Runs on mount or when underlying data changes)
  useEffect(() => {
    const savedCash = localStorage.getItem("strategy_starting_cash_kwd");
    const savedBudget = localStorage.getItem("strategy_project_budget_kwd");

    if (savedCash && savedBudget) {
        setStartingCashInKWD(parseFloat(savedCash));
        setProjectBudgetInKWD(parseFloat(savedBudget));
    } else {
        setStartingCashInKWD(realLiquidCashInKWD);
        setProjectBudgetInKWD(totalMonthlyFreeInKWD);
    }
    setIsLoaded(true);
  }, [realLiquidCashInKWD, totalMonthlyFreeInKWD]);

  // 4. SAVE HANDLERS (using KWD)
  const handleCashChange = (val: number) => {
    setStartingCashInKWD(val);
    localStorage.setItem("strategy_starting_cash_kwd", val.toString());
  };

  const handleBudgetChange = (val: number) => {
    const safeVal = Math.max(0, val); 
    setProjectBudgetInKWD(safeVal);
    localStorage.setItem("strategy_project_budget_kwd", safeVal.toString());
  };

  const handleReset = () => {
    if(confirm("Reset to live actual values (in KWD)?")) {
        setStartingCashInKWD(realLiquidCashInKWD);
        setProjectBudgetInKWD(totalMonthlyFreeInKWD);
        localStorage.removeItem("strategy_starting_cash_kwd");
        localStorage.removeItem("strategy_project_budget_kwd");
    }
  };

  const duplexBudgetInKWD = totalMonthlyFreeInKWD - projectBudgetInKWD;
  
  // Helper to display KWD values in the globally selected currency
  const formatForDisplay = (kwdValue: number) => {
      const valueInDisplayCurrency = convert(kwdValue, 'KWD', currency, rates);
      return fmt(valueInDisplayCurrency);
  }

  // --- 5. PREPARE OBLIGATIONS (in KWD) ---
  const allObligationsInKWD: any[] = [];
  const today = new Date();

  data.liabilities.installments.forEach(inst => {
    if (inst.schedule) {
        inst.schedule.forEach(item => {
            const date = new Date(item.date);
            if (date >= today) {
                allObligationsInKWD.push({
                    date: date,
                    amount: convert(item.amount, inst.currency, 'KWD', rates), // Convert to KWD
                    name: `${inst.project} (${item.description})`,
                });
            }
        });
    }
  });
  allObligationsInKWD.sort((a, b) => a.date.getTime() - b.date.getTime());

  // --- 6. RUN SIMULATION (in KWD) ---
  const monthlyAnalysis = [];
  
  let runningBalanceInKWD = isLoaded ? startingCashInKWD : realLiquidCashInKWD;
  const budgetToUseInKWD = isLoaded ? projectBudgetInKWD : totalMonthlyFreeInKWD;

  let cursor = startOfMonth(today);
  
  for (let i = 0; i < 24; i++) {
      runningBalanceInKWD += budgetToUseInKWD;

      const monthsBills = allObligationsInKWD.filter(o => isSameMonth(o.date, cursor));
      const billsTotalInKWD = monthsBills.reduce((sum, item) => sum + item.amount, 0);

      runningBalanceInKWD -= billsTotalInKWD;

      monthlyAnalysis.push({
          month: formatDate(cursor, 'MMMM yyyy'),
          monthlyAddInKWD: budgetToUseInKWD,
          bills: monthsBills,
          billsTotalInKWD: billsTotalInKWD,
          endBalanceInKWD: runningBalanceInKWD,
          isShortage: runningBalanceInKWD < 0
      });

      cursor = addMonths(cursor, 1);
  }

  const firstShortage = monthlyAnalysis.find(m => m.isShortage);

  if (!isLoaded) return <div className="p-8 text-center text-muted-foreground">Loading Strategy...</div>;

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
                    <p className="text-sm">Installments exceed Cash + Allocation.</p>
                </div>
             </div>
        ) : (
             <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-4 text-emerald-400 w-full md:w-auto">
                <CheckCircle className="h-8 w-8 shrink-0" />
                <div>
                    <p className="font-bold text-lg">Healthy Runway</p>
                    <p className="text-sm">Starting Cash + Allocation covers 2 Years.</p>
                </div>
             </div>
        )}
      </div>

      {/* --- STRATEGY CONTROL PANEL --- */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-500">
          <div className="flex flex-col md:flex-row justify-between items-end mb-4">
              <div>
                  <h2 className="text-xl font-bold text-white">Monthly Allocation Strategy</h2>
                  <p className="text-sm text-muted-foreground">Total Free Cash: <span className="text-white font-bold">{formatForDisplay(totalMonthlyFreeInKWD)}</span></p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-white mt-2 md:mt-0">
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset to Actuals
              </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* INPUT 1: STARTING CASH */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex justify-between"><label className="text-sm font-bold text-slate-300">Starting Available Cash</label><Coins className="h-4 w-4 text-slate-400"/></div>
                  <div className="relative">
                    <Input 
                        type="number" 
                        value={Math.round(startingCashInKWD)} 
                        onChange={(e) => handleCashChange(parseFloat(e.target.value) || 0)}
                        className="bg-black/40 border-slate-600 text-2xl font-mono text-white h-12 pr-12"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">KWD</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Edit to test scenarios. <span className="text-emerald-500">Saved automatically.</span></p>
              </div>

              {/* INPUT 2: PROJECT BUDGET */}
              <div className="space-y-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex justify-between"><label className="text-sm font-bold text-blue-400">Monthly Project Allocation</label><Wallet className="h-4 w-4 text-blue-400"/></div>
                  <div className="relative">
                    <Input 
                        type="number" 
                        value={Math.round(projectBudgetInKWD)} 
                        onChange={(e) => handleBudgetChange(parseFloat(e.target.value))}
                        className="bg-black/40 border-blue-500/50 text-2xl font-mono text-white h-12 pr-12"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">KWD</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Slider value={[projectBudgetInKWD]} max={totalMonthlyFreeInKWD * 1.5} step={100} onValueChange={(val) => handleBudgetChange(val[0])} className="cursor-pointer" />
                    <p className="text-[10px] text-blue-300/70 text-center">Drag to adjust allocation</p>
                  </div>
              </div>

              {/* OUTPUT: DUPLEX BUDGET */}
              <div className="space-y-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex justify-between"><label className="text-sm font-bold text-purple-400">Left for Duplex / Life</label><Home className="h-4 w-4 text-purple-400"/></div>
                  <div className="text-2xl font-bold text-white font-mono h-12 flex items-center">{formatForDisplay(duplexBudgetInKWD)}</div>
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
                    <div><p className="font-bold text-white text-lg">{month.month}</p><p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Adds {formatForDisplay(month.monthlyAddInKWD)}</p></div>
                </div>
                <div className="flex-1 w-full lg:border-l lg:border-r border-white/10 lg:px-6 space-y-2">
                    {month.bills.length > 0 ? (
                        month.bills.map((o: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-black/20 p-2 rounded border border-white/5">
                                <span className="text-slate-300">{o.name}</span>
                                <span className="text-rose-400 font-bold font-mono">-{formatForDisplay(o.amount)}</span>
                            </div>
                        ))
                    ) : <div className="text-xs text-muted-foreground italic py-2">No installments due.</div>}
                </div>
                <div className="w-full lg:w-1/5 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Project Balance</p>
                    <p className={`text-2xl font-bold font-mono ${month.endBalanceInKWD < 0 ? 'text-red-500' : 'text-white'}`}>{formatForDisplay(month.endBalanceInKWD)}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

    

    