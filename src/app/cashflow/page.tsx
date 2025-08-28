"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { cashFlowItems } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"

export default function CashFlowPage() {
    const { format } = useCurrency();

    const totalIncome = cashFlowItems
        .filter(item => item.type === 'Income')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = cashFlowItems
        .filter(item => item.type === 'Expense')
        .reduce((sum, item) => sum + item.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;

    const chartData = [
        { name: 'Monthly Flow', income: totalIncome, expenses: totalExpenses }
    ];
    
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{format(totalIncome)}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{format(totalExpenses)}</p>
                        <p className="text-xs text-muted-foreground">per month (incl. avg. installments)</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Net Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{format(netCashFlow)}</p>
                        <p className="text-xs text-primary-foreground/80">per month</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Income vs. Expenses</CardTitle>
                    <CardDescription>A visual breakdown of your monthly cash flow.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                            <XAxis type="number" tickFormatter={(value) => format(value).replace(/[^0-9-]/g, '')} />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip
                                formatter={(value: number) => format(value)}
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
