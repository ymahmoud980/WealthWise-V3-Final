"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calculator, Building2 } from "lucide-react"
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

        {/* --- 1. INCOME BREAKDOWN (Restored) --- */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-white">Monthly Income Sources</h3>
          </div>
          <div className="space-y-1">
            <Row label="Monthly Salary" value={metrics.income.salary} isTotal format={format} />
            
            <div className="pt-2">
                <span className="text-sm font-semibold text-foreground">Rental Income</span>
            </div>
            
            {(data.assets.realEstate || []).filter(r => r.monthlyRent > 0).map(r => {
                // Calculate monthly equivalent based on frequency
                let rawRent = Number(r.monthlyRent) || 0;
                let convertedRent = convert(rawRent, r.rentCurrency || r.currency, currency, rates);
                
                let monthlyEquiv = convertedRent;
                if (r.rentFrequency === 'semi-annual') monthlyEquiv = convertedRent / 6;
                else if (r.rentFrequency === 'quarterly') monthlyEquiv = convertedRent / 3;
                else if (r.rentFrequency === 'annual') monthlyEquiv = convertedRent / 12;

                return (
                    <Row 
                        key={r.id} 
                        label={`${r.name} (${r.rentFrequency || 'monthly'})`} 
                        value={monthlyEquiv} 
                        isSub 
                        format={format} 
                    />
                )
             })}
            
            <Row label="Total Monthly Income" value={metrics.totalIncome} isGrandTotal={true} format={format} />
          </div>
        </div>

        {/* --- 2. EXPENSE BREAKDOWN --- */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-white">Monthly Expenses</h3>
          </div>
          <div className="space-y-1">
             <Row label="Loan Payments" value={metrics.expenses.loans} isTotal isNegative format={format} />
             {(data.liabilities.loans || []).map(l => <Row key={l.id} label={`${l.lender} Loan`} value={convert(l.monthlyPayment, l.currency, currency, rates)} isSub isNegative format={format} />)}
            
            <Row label="Household Expenses" value={metrics.expenses.household} isTotal isNegative format={format} />
            {(data.monthlyExpenses.household || []).map(h => <Row key={h.id} label={h.description} value={convert(h.amount, h.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="Project Installments (Avg)" value={metrics.expenses.installmentsAvg} isTotal isNegative format={format} />
            
            <Row label="Total Monthly Outflow" value={metrics.totalExpenses} isGrandTotal={true} isNegative format={format} />
          </div>
        </div>

        {/* --- 3. NET WORTH --- */}
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-amber-500">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold text-white">Net Worth Formula</h2>
          </div>
          <div className="space-y-1">
            <Row label="Total Assets (Real Estate + Cash + Metals + Others)" value={metrics.totalAssets} format={format} />
            <Row label="Total Liabilities (Loans + Outstanding Installments)" value={metrics.totalLiabilities} isNegative={true} format={format} />
            <Row label="Net Worth" value={metrics.netWorth} isGrandTotal={true} format={format} />
          </div>
        </div>

      </div>
    </div>
  )
}