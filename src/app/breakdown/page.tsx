"use client";

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calculator, Building2, Coins, Briefcase } from "lucide-react"
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
          <p className="text-muted-foreground mt-2">Complete breakdown of all assets, liabilities, and cash flow in {currency}.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">

        {/* --- 1. ASSETS DETAIL --- */}
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
             {(data.assets.otherAssets || []).map(a => <Row key={a.id} label={a.description} value={convert(a.value, a.currency, currency, rates)} isSub format={format} />)}

             <Row label="TOTAL ASSETS" value={metrics.totalAssets} isGrandTotal={true} format={format} />
           </div>
        </div>

        {/* --- 2. LIABILITIES DETAIL --- */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Liabilities</h3></div>
           <div className="space-y-1">
             <Row label="Bank Loans" value={metrics.liabilities.loans} isTotal isNegative format={format} />
             {(data.liabilities.loans || []).map(l => <Row key={l.id} label={`${l.lender} Loan`} value={convert(l.remaining, l.currency, currency, rates)} isSub isNegative format={format} />)}

             <Row label="Outstanding Installments" value={metrics.liabilities.installments} isTotal isNegative format={format} />
             {(data.liabilities.installments || []).map(i => <Row key={i.id} label={i.project} value={convert(i.total - i.paid, i.currency, currency, rates)} isSub isNegative format={format} />)}

             <Row label="TOTAL LIABILITIES" value={metrics.totalLiabilities} isGrandTotal={true} isNegative format={format} />
           </div>
        </div>

        {/* --- 3. INCOME DETAIL --- */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><Wallet className="h-5 w-5 text-emerald-500" /><h3 className="font-bold text-white">Monthly Income</h3></div>
           <div className="space-y-1">
             <Row label="Salary" value={metrics.income.salary} isTotal format={format} />
             <Row label="Rental Income (Avg)" value={metrics.income.rent} isTotal format={format} />
             {(data.assets.realEstate || []).filter(r => Number(r.monthlyRent) > 0).map(r => {
                let val = convert(r.monthlyRent, r.rentCurrency || r.currency, currency, rates);
                if(r.rentFrequency === 'quarterly') val /= 3;
                if(r.rentFrequency === 'semi-annual') val /= 6;
                if(r.rentFrequency === 'annual') val /= 12;
                return <Row key={r.id} label={`${r.name} (${r.rentFrequency})`} value={val} isSub format={format} />
             })}
             <Row label="TOTAL MONTHLY IN" value={metrics.totalIncome} isGrandTotal={true} format={format} />
           </div>
        </div>

        {/* --- 4. EXPENSE DETAIL --- */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Monthly Expenses</h3></div>
           <div className="space-y-1">
             <Row label="Loan Payments" value={metrics.expenses.loans} isTotal isNegative format={format} />
             <Row label="Household" value={metrics.expenses.household} isTotal isNegative format={format} />
             <Row label="Installments (Avg/Mo)" value={metrics.expenses.installmentsAvg} isTotal isNegative format={format} />
             {(data.liabilities.installments || []).map(i => {
                let val = convert(i.amount, i.currency, currency, rates);
                if(i.frequency === 'Quarterly') val /= 3;
                if(i.frequency === 'Semi-Annual') val /= 6;
                if(i.frequency === 'Annual') val /= 12;
                return <Row key={i.id} label={i.project} value={val} isSub isNegative format={format} />
             })}
             <Row label="TOTAL MONTHLY OUT" value={metrics.totalExpenses} isGrandTotal={true} isNegative format={format} />
           </div>
        </div>

      </div>
    </div>
  )
}