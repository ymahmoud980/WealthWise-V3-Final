"use client";

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calculator } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { cn } from "@/lib/utils";

const Row = ({ label, value, isSub = false, isNegative = false, isTotal = false, isGrandTotal = false, format }: any) => (
  <div className={cn(
      "flex justify-between items-center py-1", 
      isSub ? "pl-4 text-xs text-muted-foreground" : "text-sm",
      isTotal ? "pt-3 mt-2 border-t border-dashed border-white/20 font-semibold" : "",
      isGrandTotal ? "pt-4 mt-2 border-t-2 border-white/20 text-lg font-bold bg-white/5 -mx-4 px-4" : ""
  )}>
      <span className={cn(isTotal || isGrandTotal ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className={cn(
          "font-mono",
          isGrandTotal ? "text-primary" : "",
          isNegative ? "text-rose-400" : (isTotal || isGrandTotal ? "text-emerald-400" : "text-foreground")
      )}>
          {isNegative && '- '}{format(value)}
      </span>
  </div>
);

export default function BreakdownPage() {
  const { currency, format, rates } = useCurrency();
  const { data, metrics } = useFinancialData();

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="glass-panel p-6 rounded-xl">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Calculator className="h-8 w-8 text-primary" />
            Financial Ledger
          </h1>
          <p className="text-muted-foreground mt-2">Detailed audit trail of all calculations converted to {currency}.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">

        {/* ASSETS DETAIL */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-emerald-500" /><h3 className="font-bold text-white">Assets</h3></div>
           <div className="space-y-1">
             <Row label="Ready Properties" value={metrics.assets.existingRealEstate} isTotal format={format} />
             {(data.assets.realEstate || []).map(a => <Row key={a.id} label={a.name} value={convert(a.currentValue, a.currency, currency, rates)} isSub format={format} />)}
             
             <Row label="Off-Plan Projects" value={metrics.assets.offPlanRealEstate} isTotal format={format} />
             {(data.assets.underDevelopment || []).map(a => <Row key={a.id} label={a.name} value={convert(a.currentValue, a.currency, currency, rates)} isSub format={format} />)}

             <Row label="Cash & Bank" value={metrics.assets.cash} isTotal format={format} />
             {(data.assets.cash || []).map(a => <Row key={a.id} label={a.location} value={convert(a.amount, a.currency, currency, rates)} isSub format={format} />)}

             <Row label="Gold & Silver" value={metrics.assets.gold + metrics.assets.silver} isTotal format={format} />
             <Row label="Other Assets" value={metrics.assets.other} isTotal format={format} />

             <Row label="TOTAL ASSETS" value={metrics.totalAssets} isGrandTotal={true} format={format} />
           </div>
        </div>

        {/* LIABILITIES DETAIL */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Liabilities</h3></div>
           <div className="space-y-1">
             <Row label="Bank Loans" value={metrics.liabilities.loans} isTotal isNegative format={format} />
             <Row label="Outstanding Installments" value={metrics.liabilities.installments} isTotal isNegative format={format} />
             <Row label="TOTAL LIABILITIES" value={metrics.totalLiabilities} isGrandTotal={true} isNegative format={format} />
           </div>
        </div>

        {/* INCOME DETAIL */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><Wallet className="h-5 w-5 text-emerald-500" /><h3 className="font-bold text-white">Monthly Income</h3></div>
           <div className="space-y-1">
             <Row label="Salary" value={metrics.income.salary} isTotal format={format} />
             <Row label="Rental Income (Avg)" value={metrics.income.rent} isTotal format={format} />
             <Row label="TOTAL MONTHLY IN" value={metrics.totalIncome} isGrandTotal={true} format={format} />
           </div>
        </div>

        {/* EXPENSE DETAIL (FIXED) */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Monthly Expenses</h3></div>
           <div className="space-y-1">
             <Row label="Loan Payments" value={metrics.expenses.loans} isTotal isNegative format={format} />
             <Row label="Household" value={metrics.expenses.household} isTotal isNegative format={format} />
             
             <Row label="Project Installments (True Avg)" value={metrics.expenses.installmentsAvg} isTotal isNegative format={format} />
             {/* Detailed breakdown of how the average is calculated */}
             {(data.liabilities.installments || []).map(inst => {
                let annualBurden = 0;
                // SAME LOGIC AS CALCULATOR
                if (inst.schedule && inst.schedule.length > 0) {
                    const today = new Date();
                    const nextYear = new Date();
                    nextYear.setFullYear(today.getFullYear() + 1);
                    inst.schedule.forEach((item:any) => {
                        const d = new Date(item.date);
                        if (d >= today && d <= nextYear) annualBurden += convert(item.amount, inst.currency, currency, rates);
                    });
                } else {
                    // Fallback
                    const amt = convert(inst.amount, inst.currency, currency, rates);
                    if (inst.frequency === 'Monthly') annualBurden = amt * 12;
                    else if (inst.frequency === 'Quarterly') annualBurden = amt * 4;
                    else if (inst.frequency === 'Semi-Annual') annualBurden = amt * 2;
                    else annualBurden = amt;
                }

                const monthlyAvg = annualBurden / 12;
                return <Row key={inst.id} label={`${inst.project} (Next 12m: ${format(annualBurden)})`} value={monthlyAvg} isSub isNegative format={format} />
             })}

             <Row label="TOTAL MONTHLY OUT" value={metrics.totalExpenses} isGrandTotal={true} isNegative format={format} />
           </div>
        </div>

      </div>
    </div>
  )
}