
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { assets, liabilities, cashFlowItems } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"
import type { ExchangeRates, Currency } from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"

const rates: ExchangeRates = {
  USD: 1,
  EGP: 47.5,
  KWD: 0.31,
  TRY: 32.8,
};

const convertToUsd = (value: number, currency: keyof ExchangeRates) => {
  return value / rates[currency];
}

export default function BreakdownPage() {
  const { format } = useCurrency();

  const assetValue = assets.reduce((acc, asset) => acc + convertToUsd(asset.marketValue, asset.currency), 0);
  const liabilitiesValue = liabilities.reduce((acc, liability) => {
    const remaining = liability.totalAmount - liability.amountPaid;
    return liability.totalAmount > 0 ? acc + convertToUsd(remaining, liability.currency) : acc;
  }, 0);
  const netWorth = assetValue - liabilitiesValue;

  const monthlyRentalIncome = assets.reduce((sum, asset) => sum + convertToUsd(asset.rentalIncome, asset.currency), 0);
  const monthlySalary = cashFlowItems
    .filter(item => item.type === 'Income' && item.category === 'Salary')
    .reduce((sum, item) => sum + convertToUsd(item.amount, item.currency), 0);
  const totalIncome = monthlyRentalIncome + monthlySalary;

  const monthlyInstallments = liabilities.reduce((sum, liability) => sum + convertToUsd(liability.monthlyInstallment, liability.currency), 0);
  const monthlyHouseholdExpenses = cashFlowItems
    .filter(item => item.type === 'Expense' && item.category === 'Household')
    .reduce((sum, item) => sum + convertToUsd(item.amount, item.currency), 0);
  const totalExpenses = monthlyInstallments + monthlyHouseholdExpenses;
  
  const cashFlow = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Calculation Breakdown</h1>
      
      <div className="grid gap-8 md:grid-cols-2">

        {/* Net Worth Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>Net Worth Breakdown</span>
            </CardTitle>
            <CardDescription>How your total net worth is calculated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Asset Value</span>
              <span className="font-bold text-green-600">{format(assetValue, 'USD')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Liabilities</span>
              <span className="font-bold text-red-600">- {format(liabilitiesValue, 'USD')}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Net Worth</span>
              <span className="font-extrabold text-primary">{format(netWorth, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Flow Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-500" />
              <span>Net Cash Flow Breakdown</span>
            </CardTitle>
            <CardDescription>How your monthly cash flow is calculated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Monthly Income</span>
              <span className="font-bold text-green-600">{format(totalIncome, 'USD')}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Monthly Expenses</span>
              <span className="font-bold text-red-600">- {format(totalExpenses, 'USD')}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Avg. Net Cash Flow</span>
              <span className="font-extrabold text-primary">{format(cashFlow, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Asset Value Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span>Asset Value Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Value (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell className="text-right">{format(convertToUsd(asset.marketValue, asset.currency), 'USD')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Liabilities Breakdown */}
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-red-500" />
                <span>Liabilities Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Liability</TableHead>
                  <TableHead className="text-right">Remaining Amount (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.filter(l => l.totalAmount > 0).map(liability => (
                  <TableRow key={liability.id}>
                    <TableCell>{liability.name}</TableCell>
                    <TableCell className="text-right">{format(convertToUsd(liability.totalAmount - liability.amountPaid, liability.currency), 'USD')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
