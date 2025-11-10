
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useCurrency } from "@/hooks/use-currency"
import { convert } from "@/lib/calculations"
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FinancialData, HouseholdExpense } from "@/lib/types";
import { AddExpenseDialog } from "@/components/cashflow/AddExpenseDialog";
import { Trash2 } from "lucide-react";

export default function CashFlowPage() {
    const { currency, format, rates } = useCurrency();
    const { data, setData, metrics } = useFinancialData();
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));
    const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

    const { income, totalIncome, expenses, totalExpenses, netCashFlow } = metrics;
    
    const chartData = [
        { name: 'Income', Salary: income.salary, Rentals: income.rent },
        { name: 'Expenses', Loans: expenses.loans, Household: expenses.household, Installments: expenses.installmentsAvg }
    ];

    const handleEditClick = () => {
        setEditableData(JSON.parse(JSON.stringify(data)));
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setData(editableData);
        setIsEditing(false);
    };
    
    const handleCancelClick = () => {
        // No need to reset editableData, as it will be reset on next edit click
        setIsEditing(false);
    };

    const handleSalaryChange = (value: string) => {
        const numericValue = parseFloat(value) || 0;
        const newData = { ...editableData };
        newData.assets.salary.amount = numericValue;
        setEditableData(newData);
    };

    const handleHouseholdChange = (id: string, key: 'description' | 'amount', value: string) => {
        const newData = { ...editableData };
        const expense = newData.monthlyExpenses.household.find(h => h.id === id);
        if (expense) {
            if (key === 'amount') {
                 expense[key] = parseFloat(value) || 0;
            } else {
                expense[key] = value;
            }
            setEditableData(newData);
        }
    };
    
    const handleAddExpense = (newExpense: Omit<HouseholdExpense, 'id'>) => {
        const fullExpense: HouseholdExpense = {
          ...newExpense,
          id: `he${new Date().getTime()}`,
        };
        const updatedData = JSON.parse(JSON.stringify(data));
        updatedData.monthlyExpenses.household.push(fullExpense);
        setData(updatedData);
        setIsAddExpenseDialogOpen(false);
    }
    
    const handleDeleteExpense = (id: string) => {
        const updatedData = { ...editableData };
        updatedData.monthlyExpenses.household = updatedData.monthlyExpenses.household.filter(h => h.id !== id);
        setEditableData(updatedData);
    }

    const currentData = isEditing ? editableData : data;
    const currentNetCashFlow = netCashFlow;

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Cash Flow</h1>
                        <p className="text-muted-foreground">Track your monthly income and expenses.</p>
                    </div>
                     <div className="flex gap-2">
                         {isEditing ? (
                          <>
                            <Button onClick={handleSaveClick}>Save Changes</Button>
                            <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
                          </>
                        ) : (
                          <Button onClick={handleEditClick}>Edit</Button>
                        )}
                    </div>
                </div>
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
                    <Card className={currentNetCashFlow >= 0 ? "bg-green-100" : "bg-red-100"}>
                        <CardHeader><CardTitle>Net Cash Flow</CardTitle></CardHeader>
                        <CardContent>
                            <p className={`text-3xl font-bold ${currentNetCashFlow >= 0 ? "text-green-800" : "text-red-800"}`}>{format(currentNetCashFlow)}</p>
                            <p className={`text-xs ${currentNetCashFlow >= 0 ? "text-green-700" : "text-red-700"}`}>per month</p>
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
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Salary</span>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                 <Input 
                                                    type="number" 
                                                    defaultValue={currentData.assets.salary.amount}
                                                    onBlur={(e) => handleSalaryChange(e.target.value)}
                                                    className="h-8 max-w-[120px]"
                                                />
                                                <span>{currentData.assets.salary.currency}</span>
                                            </div>
                                        ) : (
                                            <span className="text-green-700">{format(income.salary)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Property Rentals</span><span className="text-green-700">{format(income.rent)}</span></div>
                                </div>
                            </div>

                             <div className="p-3 bg-red-100/60 rounded-lg">
                                <div className="flex justify-between items-center font-semibold text-red-800">
                                    <span>Total Monthly Expenses</span>
                                    <span className="text-base font-bold text-red-900">{format(totalExpenses)}</span>
                                </div>
                                <div className="pl-4 mt-2 space-y-1">
                                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Loan Payments</span><span className="text-red-700">{format(expenses.loans)}</span></div>
                                    {(currentData.monthlyExpenses.household || []).map(h => (
                                         <div key={h.id} className="flex justify-between items-center group">
                                            {isEditing ? (
                                                <>
                                                    <Input
                                                        defaultValue={h.description}
                                                        onBlur={(e) => handleHouseholdChange(h.id, 'description', e.target.value)}
                                                        className="h-8 max-w-[150px] text-muted-foreground"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            type="number" 
                                                            defaultValue={h.amount}
                                                            onBlur={(e) => handleHouseholdChange(h.id, 'amount', e.target.value)}
                                                            className="h-8 max-w-[100px]"
                                                        />
                                                        <span>{h.currency}</span>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDeleteExpense(h.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                 <span className="text-muted-foreground">{h.description}</span>
                                                 <span className="text-red-700">{format(convert(h.amount, h.currency, currency, rates))}</span>
                                                </>
                                            )}
                                         </div>
                                    ))}
                                    {isEditing && (
                                        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setIsAddExpenseDialogOpen(true)}>Add Household Expense</Button>
                                    )}
                                    <div className="flex justify-between items-center border-t mt-1 pt-1 font-medium"><span className="">Avg. Project Installments</span><span className="text-red-700">{format(expenses.installmentsAvg)}</span></div>
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
                                    <Bar dataKey="Salary" stackId="a" fill="hsl(var(--chart-2))" />
                                    <Bar dataKey="Rentals" stackId="a" fill="hsl(var(--chart-4))" />
                                    <Bar dataKey="Loans" stackId="b" fill="hsl(var(--chart-3))" />
                                    <Bar dataKey="Household" stackId="b" fill="hsl(var(--chart-5))" />
                                    <Bar dataKey="Installments" stackId="b" fill="#F87171" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <AddExpenseDialog
                isOpen={isAddExpenseDialogOpen}
                onClose={() => setIsAddExpenseDialogOpen(false)}
                onAddExpense={handleAddExpense}
            />
        </>
    )
}
