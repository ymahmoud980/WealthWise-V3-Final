"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { useCurrency } from "@/hooks/use-currency"
import { convert } from "@/lib/calculations"
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FinancialData, HouseholdExpense } from "@/lib/types";
import { AddExpenseDialog } from "@/components/cashflow/AddExpenseDialog";
import { Trash2, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const GlassInput = (props: any) => (
    <Input 
      {...props} 
      className={cn("bg-black/20 border-white/10 text-foreground focus:ring-primary/50 h-8", props.className)} 
    />
  );

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
    
    const handleCancelClick = () => setIsEditing(false);

    // (Keep your existing handlers exactly the same)
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
            if (key === 'amount') expense[key] = parseFloat(value) || 0;
            else expense[key] = value;
            setEditableData(newData);
        }
    };
    
    const handleAddExpense = (newExpense: Omit<HouseholdExpense, 'id'>) => {
        const fullExpense: HouseholdExpense = { ...newExpense, id: `he${new Date().getTime()}` };
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
        <div className="space-y-8">
            <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
                <div>
                    <h1 className="text-3xl font-bold">Cash Flow Analysis</h1>
                    <p className="text-muted-foreground">Monthly inflows vs outflows.</p>
                </div>
                 <div className="flex gap-2">
                     {isEditing ? (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveClick}>Save</Button>
                        <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={handleEditClick}>Edit Mode</Button>
                    )}
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-panel p-6 rounded-xl border-b-4 border-b-emerald-500 relative overflow-hidden">
                    <div className="absolute right-4 top-4 p-2 bg-emerald-500/10 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-500"/></div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Total Income</p>
                    <p className="text-3xl font-mono font-bold text-emerald-400 mt-2">{format(totalIncome)}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-b-4 border-b-rose-500 relative overflow-hidden">
                    <div className="absolute right-4 top-4 p-2 bg-rose-500/10 rounded-lg"><TrendingDown className="h-5 w-5 text-rose-500"/></div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Total Expenses</p>
                    <p className="text-3xl font-mono font-bold text-rose-400 mt-2">{format(totalExpenses)}</p>
                </div>
                <div className={cn("glass-panel p-6 rounded-xl border-b-4 relative overflow-hidden", currentNetCashFlow >= 0 ? "border-b-blue-500" : "border-b-yellow-500")}>
                    <div className="absolute right-4 top-4 p-2 bg-blue-500/10 rounded-lg"><ArrowRightLeft className="h-5 w-5 text-blue-500"/></div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Net Cash Flow</p>
                    <p className={cn("text-3xl font-mono font-bold mt-2", currentNetCashFlow >= 0 ? "text-blue-400" : "text-yellow-400")}>
                        {format(currentNetCashFlow)}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Detailed Ledger */}
                <div className="glass-panel p-6 rounded-xl space-y-6">
                    <h3 className="text-xl font-bold">Monthly Breakdown</h3>
                    
                    {/* Income Section */}
                    <div className="space-y-2">
                        <div className="text-xs uppercase text-emerald-500 font-bold tracking-wider">Inflows</div>
                        <div className="bg-black/20 rounded-lg p-4 space-y-3 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Monthly Salary</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                         <GlassInput 
                                            type="number" 
                                            defaultValue={currentData.assets.salary.amount}
                                            onBlur={(e: any) => handleSalaryChange(e.target.value)}
                                            className="w-24 text-right"
                                        />
                                        <span className="text-xs">{currentData.assets.salary.currency}</span>
                                    </div>
                                ) : (
                                    <span className="font-mono font-bold text-emerald-400">{format(income.salary)}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Rentals</span>
                                <span className="font-mono font-bold text-emerald-400">{format(income.rent)}</span>
                            </div>
                        </div>
                    </div>

                     {/* Expense Section */}
                     <div className="space-y-2">
                        <div className="text-xs uppercase text-rose-500 font-bold tracking-wider">Outflows</div>
                        <div className="bg-black/20 rounded-lg p-4 space-y-3 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Loan Repayments</span>
                                <span className="font-mono font-medium text-rose-400">{format(expenses.loans)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Project Installments (Avg)</span>
                                <span className="font-mono font-medium text-rose-400">{format(expenses.installmentsAvg)}</span>
                            </div>
                            
                            <div className="border-t border-white/10 my-2 pt-2"></div>
                            
                            {(currentData.monthlyExpenses.household || []).map(h => (
                                 <div key={h.id} className="flex justify-between items-center group">
                                    {isEditing ? (
                                        <div className="flex gap-2 w-full">
                                            <GlassInput
                                                defaultValue={h.description}
                                                onBlur={(e: any) => handleHouseholdChange(h.id, 'description', e.target.value)}
                                                className="flex-1"
                                            />
                                            <GlassInput 
                                                type="number" 
                                                defaultValue={h.amount}
                                                onBlur={(e: any) => handleHouseholdChange(h.id, 'amount', e.target.value)}
                                                className="w-20 text-right"
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteExpense(h.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                         <span className="text-sm text-muted-foreground">{h.description}</span>
                                         <span className="font-mono font-medium text-rose-400">{format(convert(h.amount, h.currency, currency, rates))}</span>
                                        </>
                                    )}
                                 </div>
                            ))}
                            
                            {isEditing && (
                                <Button size="sm" variant="ghost" className="w-full text-muted-foreground hover:text-foreground mt-2 border border-dashed border-white/20" onClick={() => setIsAddExpenseDialogOpen(true)}>+ Add Expense</Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="glass-panel p-6 rounded-xl flex flex-col">
                    <h3 className="text-xl font-bold mb-6">Flow Visualization</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: number) => format(value)} 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Legend />
                                <Bar dataKey="Salary" stackId="a" fill="#10b981" />
                                <Bar dataKey="Rentals" stackId="a" fill="#34d399" />
                                <Bar dataKey="Loans" stackId="b" fill="#f43f5e" />
                                <Bar dataKey="Household" stackId="b" fill="#fb7185" />
                                <Bar dataKey="Installments" stackId="b" fill="#e11d48" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
             <AddExpenseDialog
                isOpen={isAddExpenseDialogOpen}
                onClose={() => setIsAddExpenseDialogOpen(false)}
                onAddExpense={handleAddExpense}
            />
        </div>
    )
}