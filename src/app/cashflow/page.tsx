
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useCurrency } from "@/hooks/use-currency"
import { calculateMetrics } from "@/lib/calculations"
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function CashFlowPage() {
    const { currency, format } = useCurrency();
    const { data } = useFinancialData();

    const metrics = calculateMetrics(data, currency);
    const { income, totalIncome, expenses, totalExpenses, netCashFlow } = metrics;
    
    const chartData = [
        { name: 'Income', Salary: income.salary, Rentals: income.rent },
        { name: 'Expenses', Loans: expenses.loans, Household: expenses.household, Installments: expenses.installmentsAvg }
    ];

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{format(totalIncome)}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{format(totalExpenses)}</p>
                        <p className="text-xs text-muted-foreground">per month (incl. avg. installments)</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader><CardTitle>Net Cash Flow</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{format(netCashFlow)}</p>
                        <p className="text-xs text-primary-foreground/80">per month</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Figures</CardTitle>
                        <CardDescription>A detailed breakdown of your cash flow.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="p-3 bg-green-100/60 rounded-lg">
                            <div className="flex justify-between items-center font-semibold text-green-800">
                                <span>Total Income</span>
                                <span className="text-base font-bold text-green-900">{format(totalIncome)}</span>
                            </div>
                            <div className="pl-4 mt-2 space-y-1">
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Salary</span><span>{format(income.salary)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Property Rentals</span><span>{format(income.rent)}</span></div>
                            </div>
                        </div>

                         <div className="p-3 bg-red-100/60 rounded-lg">
                            <div className="flex justify-between items-center font-semibold text-red-800">
                                <span>Total Monthly Expenses</span>
                                <span className="text-base font-bold text-red-900">{format(totalExpenses)}</span>
                            </div>
                            <div className="pl-4 mt-2 space-y-1">
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Loan Payments</span><span>{format(expenses.loans)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Household Expenses</span><span>{format(expenses.household)}</span></div>
                                <div className="flex justify-between items-center border-t mt-1 pt-1 font-medium"><span className="">Avg. Project Installments</span><span>{format(expenses.installmentsAvg)}</span></div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs. Expenses Chart</CardTitle>
                        <CardDescription>Visualizing your monthly cash flow categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => format(value).replace(/[^0-9-]/g, '')}/>
                                <Tooltip formatter={(value: number) => format(value)} />
                                <Legend />
                                <Bar dataKey="Salary" stackId="a" fill="hsl(var(--chart-1))" />
                                <Bar dataKey="Rentals" stackId="a" fill="hsl(var(--chart-2))" />
                                <Bar dataKey="Loans" stackId="b" fill="hsl(var(--chart-3))" />
                                <Bar dataKey="Household" stackId="b" fill="hsl(var(--chart-4))" />
                                <Bar dataKey="Installments" stackId="b" fill="hsl(var(--chart-5))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
