"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Currency, ExchangeRates } from "@/lib/types"

const rates: ExchangeRates = {
  USD: 1,
  EGP: 47.5,
  KWD: 0.31,
};

export default function CalculatorPage() {
  const [amount, setAmount] = useState<number | string>(1000)
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD")
  const [toCurrency, setToCurrency] = useState<Currency>("EGP")

  const convertedAmount = useMemo(() => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) return 0;
    const amountInUsd = numericAmount / rates[fromCurrency]
    return amountInUsd * rates[toCurrency]
  }, [amount, fromCurrency, toCurrency])

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Currency Calculator</CardTitle>
        <CardDescription>
          Quickly convert amounts between supported currencies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="from" className="text-sm font-medium">From</label>
                <Select value={fromCurrency} onValueChange={(c) => setFromCurrency(c as Currency)}>
                    <SelectTrigger id="from">
                        <SelectValue placeholder="From currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                        <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwap}>
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>

        <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium">To</label>
            <Select value={toCurrency} onValueChange={(c) => setToCurrency(c as Currency)}>
                <SelectTrigger id="to">
                    <SelectValue placeholder="To currency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                    <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="pt-4">
            <p className="text-lg text-muted-foreground">Converted Amount:</p>
            <p className="text-4xl font-bold text-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                maximumFractionDigits: 2,
              }).format(convertedAmount)}{' '}
              <span className="text-2xl font-medium text-muted-foreground">{toCurrency}</span>
            </p>
        </div>
      </CardContent>
    </Card>
  )
}
