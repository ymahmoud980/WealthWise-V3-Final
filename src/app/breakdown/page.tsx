
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency";
import { calculateMetrics } from "@/lib/calculations";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function BreakdownPage() {
  const { currency, format } = useCurrency();
  const { data } = useFinancialData();

  const metrics = calculateMetrics(data, currency);

  const Row = ({ label, value, isSub = false, isNegative = false, isTotal = false }: { label: string, value: number, isSub?: boolean, isNegative?: boolean, isTotal?: boolean }) => (
      <div className={`flex justify-between items-center ${isSub ? 'pl-4 text-sm' : ''} ${isTotal ? 'font-bold text-lg pt-2 border-t' : ''}`}>
          <span className={isTotal ? '' : 'text-muted-foreground'}>{label}</span>
          <span className={`${isTotal ? 'text-primary' : ''} ${isNegative ? 'text-destructive' : ''}`}>{isNegative && '- '}{format(value)}</span>
      </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Calculation Breakdown</h1>
      <p className="text-muted-foreground">This section shows the math behind your key financial figures. It provides a transparent, line-by-line calculation of your total assets, liabilities, and cash flow.</p>
      
      <div className="grid gap-8 md:grid-cols-2">

        {/* Net Worth Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /><span>Net Worth</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Total Asset Value" value={metrics.totalAssets} />
            <Row label="Total Liabilities" value={metrics.totalLiabilities} isNegative={true} />
            <Separator />
            <Row label="Net Worth" value={metrics.netWorth} isTotal={true} />
          </CardContent>
        </Card>
        
        {/* Net Cash Flow Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-6 w-6 text-blue-500" /><span>Avg. Net Cash Flow</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Total Monthly Income" value={metrics.income.salary + metrics.income.rent} />
            <Row label="Total Monthly Expenses" value={metrics.expenses.loans + metrics.expenses.household + metrics.expenses.installmentsAvg} isNegative={true}/>
            <Separator />
            <Row label="Avg. Net Cash Flow" value={metrics.netCashFlow} isTotal={true} />
          </CardContent>
        </Card>

        {/* Asset Value Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-green-500" /><span>Asset Value</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label="Existing Real Estate" value={metrics.assets.existingRealEstate} isSub />
            <Row label="Off-Plan Real Estate (Paid*2)" value={metrics.assets.offPlanRealEstate} isSub />
            <Row label="Cash Holdings" value={metrics.assets.cash} isSub />
            <Row label="Gold" value={metrics.assets.gold} isSub />
            <Row label="Other Assets" value={metrics.assets.other} isSub />
            <Separator />
            <Row label="Total Asset Value" value={metrics.totalAssets} isTotal={true} />
          </CardContent>
        </Card>

        {/* Liabilities Breakdown */}
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="h-6 w-6 text-red-500" /><span>Liabilities</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label="Loans" value={metrics.liabilities.loans} isSub isNegative/>
            <Row label="Installments Remaining" value={metrics.liabilities.installments} isSub isNegative />
            <Separator />
            <Row label="Total Liabilities" value={metrics.totalLiabilities} isTotal={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
