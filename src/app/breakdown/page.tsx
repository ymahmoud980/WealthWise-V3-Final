"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-xl">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Financial Ledger
          </h1>
          <p className="text-muted-foreground mt-2">Detailed audit trail of all calculations converted to {currency}.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Net Worth Breakdown */}
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-amber-500">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold">Net Worth Formula</h2>
          </div>
          <div className="space-y-1">
            <Row label="Total Asset Value" value={metrics.totalAssets} format={format} />
            <Row label="Total Liabilities" value={metrics.totalLiabilities} isNegative={true} format={format} />
            <Row label="Net Worth" value={metrics.netWorth} isGrandTotal={true} format={format} />
          </div>
        </div>
        
        {/* Net Cash Flow Breakdown */}
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500">
           <div className="flex items-center gap-2 mb-6">
            <Wallet className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold">Cash Flow Formula</h2>
          </div>
          <div className="space-y-1">
            <Row label="Total Monthly Income" value={metrics.totalIncome} format={format} />
            <Row label="Total Monthly Expenses" value={metrics.totalExpenses} isNegative={true} format={format} />
            <Row label="Avg. Net Cash Flow" value={metrics.netCashFlow > 0 ? metrics.netCashFlow : -metrics.netCashFlow} isGrandTotal={true} format={format} isNegative={metrics.netCashFlow < 0} />
          </div>
        </div>

         {/* Income Breakdown */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-bold mb-4 text-emerald-400 uppercase text-sm tracking-wider">Income Sources</h3>
          <div className="space-y-1">
            <Row label="Salary" value={metrics.income.salary} isTotal format={format} />
            <Row label="Property Rentals" value={metrics.income.rent} isTotal format={format} />
            {(data.assets.realEstate || []).filter(r => r.monthlyRent > 0).map(r => {
                let monthlyRent = convert(r.monthlyRent, r.rentCurrency || r.currency, currency, rates);
                if (r.rentFrequency === 'semi-annual') monthlyRent = monthlyRent / 6;
                return <Row key={r.id} label={r.name} value={monthlyRent} isSub format={format} />
             })}
            <Row label="Total Monthly Income" value={metrics.totalIncome} isGrandTotal={true} format={format} />
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-bold mb-4 text-rose-400 uppercase text-sm tracking-wider">Expense Sources</h3>
          <div className="space-y-1">
             <Row label="Loan Payments" value={metrics.expenses.loans} isTotal isNegative format={format} />
             {(data.liabilities.loans || []).map(l => <Row key={l.id} label={`${l.lender} Loan`} value={convert(l.monthlyPayment, l.currency, currency, rates)} isSub isNegative format={format} />)}
            
            <Row label="Household Expenses" value={metrics.expenses.household} isTotal isNegative format={format} />
            {(data.monthlyExpenses.household || []).map(h => <Row key={h.id} label={h.description} value={convert(h.amount, h.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="Avg. Project Installments" value={metrics.expenses.installmentsAvg} isTotal isNegative format={format} />
             {(data.liabilities.installments || []).map(p => {
                let monthlyCost = 0;
                if (p.frequency === 'Annual') monthlyCost = p.amount / 12;
                else if (p.frequency === 'Semi-Annual') monthlyCost = p.amount / 6;
                else if (p.frequency === 'Quarterly') monthlyCost = p.amount / 3;
                return <Row key={p.id} label={p.project} value={convert(monthlyCost, p.currency, currency, rates)} isSub isNegative format={format} />
             })}
            <Row label="Total Monthly Expenses" value={metrics.totalExpenses} isGrandTotal={true} isNegative format={format} />
          </div>
        </div>

        {/* Asset Value Breakdown */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold">Asset Details</h3>
          </div>
          <div className="space-y-1">
            <Row label="Existing Real Estate" value={metrics.assets.existingRealEstate} isTotal format={format} />
            {(data.assets.realEstate || []).map(asset => <Row key={asset.id} label={asset.name} value={convert(asset.currentValue, asset.currency, currency, rates)} isSub format={format} />)}

            <Row label="Off-Plan Real Estate" value={metrics.assets.offPlanRealEstate} isTotal format={format} />
            {(data.assets.underDevelopment || []).map(asset => <Row key={asset.id} label={asset.name} value={convert(asset.currentValue, asset.currency, currency, rates)} isSub format={format} />)}
            
            <Row label="Cash Holdings" value={metrics.assets.cash} isTotal format={format} />
            <Row label="Gold" value={metrics.assets.gold} isTotal format={format} />
            <Row label="Silver" value={metrics.assets.silver} isTotal format={format} />
            <Row label="Other Assets" value={metrics.assets.other} isTotal format={format} />
            
            <Row label="Total Asset Value" value={metrics.totalAssets} isGrandTotal={true} format={format} />
          </div>
        </div>

        {/* Liabilities Breakdown */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold">Liabilities Details</h3>
          </div>
          <div className="space-y-1">
            <Row label="Loans" value={metrics.liabilities.loans} isTotal isNegative format={format} />
            {(data.liabilities.loans || []).map(l => <Row key={l.id} label={`${l.lender} Loan`} value={convert(l.remaining, l.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="Installments Remaining" value={metrics.liabilities.installments} isTotal isNegative format={format} />
            {(data.liabilities.installments || []).map(i => <Row key={i.id} label={i.project} value={convert(i.total - i.paid, i.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="Total Liabilities" value={metrics.totalLiabilities} isGrandTotal={true} isNegative format={format} />
          </div>
        </div>

      </div>
    </div>
  )
}