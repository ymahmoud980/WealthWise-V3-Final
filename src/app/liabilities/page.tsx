
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData } from "@/lib/types";
import { LiabilityUploader } from "@/components/liabilities/LiabilityUploader";

export default function LiabilitiesPage() {
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));

  const handleEditClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const handleLoanChange = (id: string, key: 'remaining' | 'monthlyPayment', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const loan = newData.liabilities.loans.find(l => l.id === id);
    if (loan) {
      loan[key] = numericValue;
      setEditableData(newData);
    }
  };

  const handleInstallmentChange = (id: string, key: 'total' | 'paid' | 'amount', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const installment = newData.liabilities.installments.find(i => i.id === id);
    if (installment) {
      installment[key] = numericValue;
      setEditableData(newData);
    }
  };
  
  const formatNumber = (num: number) => num.toLocaleString();

  const currentData = isEditing ? editableData : data;
  const { loans, installments } = currentData.liabilities;

  return (
    <div className="space-y-8">
      <LiabilityUploader />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liability Overview</CardTitle>
            <CardDescription>Track your installments and loans. Click "Edit" to make changes.</CardDescription>
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
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Project Installments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installments.map(p => {
                    const progress = (p.paid / p.total) * 100;
                    const remaining = p.total - p.paid;
                    return (
                    <div key={p.id} className="p-4 bg-secondary rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="font-bold">{p.project} <span className="font-normal text-muted-foreground">- {p.developer}</span></p>
                            <span className="text-sm font-semibold text-green-700">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="my-2 h-2" />
                        <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-2 mt-2">
                            <div>
                                <label className="text-xs font-medium">Total ({p.currency})</label>
                                {isEditing ? <Input type="number" value={p.total} onChange={e => handleInstallmentChange(p.id, 'total', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(p.total)}</p>}
                            </div>
                             <div>
                                <label className="text-xs font-medium">Paid ({p.currency})</label>
                                {isEditing ? <Input type="number" value={p.paid} onChange={e => handleInstallmentChange(p.id, 'paid', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(p.paid)}</p>}
                            </div>
                            <div>
                                <p className="text-muted-foreground">Remaining</p>
                                <p className="font-medium text-destructive">{formatNumber(remaining)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium">Next Installment ({p.currency})</label>
                                {isEditing ? <Input type="number" value={p.amount} onChange={e => handleInstallmentChange(p.id, 'amount', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(p.amount)}</p>}
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Next Due Date</p>
                                <p className="font-medium">{new Date(p.nextDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ({p.frequency})</p>
                            </div>
                        </div>
                    </div>)
                })}
              </div>
            </div>
            
            <div>
                <h3 className="text-xl font-semibold mb-4">Loans</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loans.map(l => {
                    const paid = l.initial - l.remaining;
                    const progress = (paid / l.initial) * 100;
                    return (
                    <div key={l.id} className="p-4 bg-secondary rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="font-bold">{l.lender} Loan</p>
                            <span className="text-sm font-semibold text-green-700">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="my-2 h-2" />
                         <div className="grid grid-cols-2 text-sm gap-2 mt-2">
                             <div>
                                <label className="text-xs font-medium">Remaining ({l.currency})</label>
                                {isEditing ? <Input type="number" value={l.remaining} onChange={e => handleLoanChange(l.id, 'remaining', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(l.remaining)}</p>}
                            </div>
                             <div>
                                <label className="text-xs font-medium">Monthly Payment ({l.currency})</label>
                                {isEditing ? <Input type="number" value={l.monthlyPayment} onChange={e => handleLoanChange(l.id, 'monthlyPayment', e.target.value)} className="h-8"/> : <p className="font-medium">{l.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>}
                            </div>
                        </div>
                    </div>)
                })}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
