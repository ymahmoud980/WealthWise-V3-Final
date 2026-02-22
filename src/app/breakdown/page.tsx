"use client";

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calculator, PiggyBank, BookOpen } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { cn } from "@/lib/utils";

const Row = ({ label, value, isSub = false, isNegative = false, isTotal = false, isGrandTotal = false, format }: any) => (
  <div className={cn(
    "flex justify-between items-center py-1",
    isSub ? "pl-6 text-xs text-muted-foreground border-l-2 border-white/5 ml-1" : "text-sm",
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

  if (!data || !metrics) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="glass-panel p-6 rounded-xl">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Calculator className="h-8 w-8 text-primary" />
          Financial Ledger
        </h1>
        <p className="text-muted-foreground mt-2">Detailed audit trail of all calculations converted to {currency}.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* --- 1. ASSETS DETAIL (Full List Restored) --- */}
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

        {/* --- 2. LIABILITIES DETAIL (Full List Restored) --- */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Liabilities</h3></div>
          <div className="space-y-1">
            <Row label="Bank Loans" value={metrics.liabilities.loans} isTotal isNegative format={format} />
            {(data.liabilities.loans || []).map((l: any) => <Row key={l.id} label={`${l.lender} Loan`} value={convert(l.remaining, l.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="Outstanding Installments" value={metrics.liabilities.installments} isTotal isNegative format={format} />
            {(data.liabilities.installments || []).map((i: any) => <Row key={i.id} label={i.project} value={convert(i.total - i.paid, i.currency, currency, rates)} isSub isNegative format={format} />)}

            <Row label="TOTAL LIABILITIES" value={metrics.totalLiabilities} isGrandTotal={true} isNegative format={format} />
          </div>
        </div>

        {/* --- 3. INCOME DETAIL --- */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4"><Wallet className="h-5 w-5 text-emerald-500" /><h3 className="font-bold text-white">Monthly Income</h3></div>
          <div className="space-y-1">
            <Row label="Salary" value={metrics.income.salary} isTotal format={format} />
            <Row label="Rental Income (Avg)" value={metrics.income.rent} isTotal format={format} />
            {(data.assets.realEstate || []).filter((r: any) => Number(r.monthlyRent) > 0).map((r: any) => {
              let val = convert(r.monthlyRent, r.rentCurrency || r.currency, currency, rates);
              if (r.rentFrequency === 'quarterly') val /= 3;
              if (r.rentFrequency === 'semi-annual') val /= 6;
              if (r.rentFrequency === 'annual') val /= 12;
              return <Row key={r.id} label={`${r.name} (${r.rentFrequency})`} value={val} isSub format={format} />
            })}
            <Row label="TOTAL MONTHLY IN" value={metrics.totalIncome} isGrandTotal={true} format={format} />
          </div>
        </div>

        {/* --- 4. EXPENSE DETAIL (DETAILED HOUSEHOLD) --- */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-rose-500" /><h3 className="font-bold text-white">Monthly Expenses</h3></div>
          <div className="space-y-1">
            <Row label="Loan Payments" value={metrics.expenses.loans} isTotal isNegative format={format} />
            {(data.liabilities.loans || []).map((l: any) => (
              <Row key={l.id} label={`${l.lender} Payment`} value={convert(l.monthlyPayment, l.currency, currency, rates)} isSub isNegative format={format} />
            ))}

            <Row label="Household" value={metrics.expenses.household} isTotal isNegative format={format} />
            {(data.monthlyExpenses.household || []).map((h: any) => (
              <Row key={h.id} label={h.description} value={convert(h.amount, h.currency, currency, rates)} isSub isNegative format={format} />
            ))}

            <Row label="Project Installments (Annualized Avg)" value={metrics.expenses.installmentsAvg} isTotal isNegative format={format} />
            {(data.liabilities.installments || []).map((inst: any) => {
              let annualBurden = 0;
              if (inst.schedule && inst.schedule.length > 0) {
                const today = new Date();
                const currentYear = today.getFullYear();
                inst.schedule.forEach((item: any) => {
                  const d = new Date(item.date);
                  if (d.getFullYear() === currentYear) annualBurden += convert(item.amount, inst.currency, currency, rates);
                });
              } else {
                const amt = convert(inst.amount, inst.currency, currency, rates);
                if (inst.frequency === 'Monthly') annualBurden = amt * 12;
                else if (inst.frequency === 'Quarterly') annualBurden = amt * 4;
                else if (inst.frequency === 'Semi-Annual') annualBurden = amt * 2;
                else annualBurden = amt;
              }
              const monthlyAvg = annualBurden / 12;
              return <Row key={inst.id} label={inst.project} value={monthlyAvg} isSub isNegative format={format} />
            })}

            <Row label="TOTAL MONTHLY OUT" value={metrics.totalExpenses} isGrandTotal={true} isNegative format={format} />
          </div>
        </div>

        {/* --- 5. SOLVENCY BASIS (Salary Only) --- */}
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4"><PiggyBank className="h-5 w-5 text-blue-500" /><h3 className="font-bold text-white">Outlook Solvency Basis (Salary Only)</h3></div>
          <div className="space-y-1">
            <Row label="Monthly Salary (Inflow)" value={metrics.income.salary} format={format} />
            <Row label="Loan Payments (Outflow)" value={metrics.expenses.loans} isNegative format={format} />
            <Row label="Household Expenses (Outflow)" value={metrics.expenses.household} isNegative format={format} />
            <Row label="MONTHLY FREE CASH" value={metrics.operatingCashFlow} isGrandTotal={true} format={format} />
            <p className="text-xs text-muted-foreground mt-2 italic">* Rental income is excluded from this calculation.</p>
          </div>
        </div>

      </div>

      {/* --- 6. CALCULATION BASIS (Documentation) --- */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 mt-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-400" /> Formulas & Calculation Basis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <span className="font-bold text-emerald-400">Total Assets</span>
            <p className="text-muted-foreground mt-1 mb-3">Sum of all converted values for: Ready Properties + Off-Plan Projects + Cash in Bank + Physical Gold & Silver + Other declared assets.</p>
          </div>
          <div>
            <span className="font-bold text-rose-400">Total Liabilities</span>
            <p className="text-muted-foreground mt-1 mb-3">Sum of all converted values for: Remaining Bank Loan Balances + Unpaid Project Installments.</p>
          </div>
          <div>
            <span className="font-bold text-white">Global Net Worth</span>
            <p className="text-muted-foreground mt-1 mb-3">Total Assets &minus; Total Liabilities.</p>
          </div>
          <div>
            <span className="font-bold text-blue-400">Monthly Free Cash Flow</span>
            <p className="text-muted-foreground mt-1 mb-3">Base Salary &minus; (Bank Loan Payments + Kuwait Household Expenses).</p>
          </div>
          <div>
            <span className="font-bold text-purple-400">Liquid Capital</span>
            <p className="text-muted-foreground mt-1 mb-3">Strictly: Cash in Bank + Physical Gold + Physical Silver.</p>
          </div>
          <div>
            <span className="font-bold text-amber-500">Leverage Ratio</span>
            <p className="text-muted-foreground mt-1 mb-3">(Total Liabilities &divide; Total Assets) &times; 100.</p>
          </div>
        </div>
      </div>
    </div>
  )
}