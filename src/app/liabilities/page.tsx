
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Loan, Installment } from "@/lib/types";
import { LiabilityUploader } from "@/components/liabilities/LiabilityUploader";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog";
import { AddInstallmentDialog } from "@/components/liabilities/AddInstallmentDialog";
import { format, isValid, parseISO, addMonths, addYears } from "date-fns";


export default function LiabilitiesPage() {
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);
  const [isAddLoanDialogOpen, setIsAddLoanDialogOpen] = useState(false);
  const [isAddInstallmentDialogOpen, setIsAddInstallmentDialogOpen] = useState(false);


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

  const handleLoanChange = (id: string, key: 'initial' | 'remaining' | 'monthlyPayment', value: string) => {
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

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    const updatedData = JSON.parse(JSON.stringify(data));

    if (type === 'installment') {
        updatedData.liabilities.installments = updatedData.liabilities.installments.filter((item: any) => item.id !== id);
    } else if (type === 'loan') {
        updatedData.liabilities.loans = updatedData.liabilities.loans.filter((item: any) => item.id !== id);
    }

    setData(updatedData);
    setDeleteTarget(null);
  };
  
  const handleAddLoan = (newLoan: Omit<Loan, 'id'>) => {
    const fullLoan: Loan = {
      ...newLoan,
      id: `l${new Date().getTime()}`,
    };

    const updatedData = {
      ...data,
      liabilities: {
        ...data.liabilities,
        loans: [...data.liabilities.loans, fullLoan],
      },
    };
    setData(updatedData);
    setIsAddLoanDialogOpen(false);
  }
  
  const handleAddInstallment = (newInstallment: Omit<Installment, 'id'>) => {
    const fullInstallment: Installment = {
      ...newInstallment,
      id: `i${new Date().getTime()}`,
    };

    const updatedData = {
      ...data,
      liabilities: {
        ...data.liabilities,
        installments: [...data.liabilities.installments, fullInstallment],
      },
    };
    setData(updatedData);
    setIsAddInstallmentDialogOpen(false);
  }

  const formatNumber = (num: number) => num.toLocaleString();
  
  const calculateCompletionDate = (p: Installment) => {
      const remaining = p.total - p.paid;
      if (remaining <= 0 || p.amount <= 0) return "Completed";

      const paymentsRemaining = Math.ceil(remaining / p.amount);
      
      // Handle non-standard date formats
      const dateParts = p.nextDueDate.split('-').map(part => parseInt(part, 10));
      const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (!isValid(dueDate)) return "Invalid Date";

      let completionDate;

      if (p.frequency === 'Quarterly') {
          completionDate = addMonths(dueDate, (paymentsRemaining -1) * 3);
      } else if (p.frequency === 'Semi-Annual') {
          completionDate = addMonths(dueDate, (paymentsRemaining - 1) * 6);
      } else if (p.frequency === 'Annual') {
          completionDate = addYears(dueDate, paymentsRemaining - 1);
      } else {
          return "Invalid Frequency";
      }
      
      return format(completionDate, 'MMM yyyy');
  }

  const currentData = isEditing ? editableData : data;
  const { loans, installments } = currentData.liabilities;

  return (
    <>
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
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Project Installments</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsAddInstallmentDialogOpen(true)}>Add Project Installment</Button>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {installments.map(p => {
                      const progress = (p.paid / p.total) * 100;
                      const remaining = p.total - p.paid;
                      const dateParts = p.nextDueDate.split('-').map(part => parseInt(part, 10));
                      const nextDueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                      const formattedDueDate = isValid(nextDueDate) ? format(nextDueDate, 'MMMM d, yyyy') : 'Invalid Date';
                      return (
                      <div key={p.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'installment', id: p.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold">{p.project} <span className="font-normal text-muted-foreground">- {p.developer}</span></p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <Progress value={progress} className="h-2 flex-1" />
                             <span className="text-sm font-semibold text-green-700">{progress.toFixed(1)}%</span>
                          </div>
                          
                          <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-2 mt-2">
                              <div>
                                  <label className="text-xs font-medium">Total ({p.currency}) (incl. Maint.)</label>
                                  {isEditing ? <Input type="number" defaultValue={p.total} onChange={e => handleInstallmentChange(p.id, 'total', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(p.total)}</p>}
                              </div>
                              <div>
                                  <label className="text-xs font-medium">Paid ({p.currency})</label>
                                  {isEditing ? <Input type="number" defaultValue={p.paid} onChange={e => handleInstallmentChange(p.id, 'paid', e.target.value)} className="h-8"/> : <p className="font-medium text-green-600">{formatNumber(p.paid)}</p>}
                              </div>
                              <div>
                                  <p className="text-muted-foreground">Remaining</p>
                                  <p className="font-medium text-destructive">{formatNumber(remaining)}</p>
                              </div>
                              <div>
                                  <label className="text-xs font-medium">Next Installment ({p.currency})</label>
                                  {isEditing ? <Input type="number" defaultValue={p.amount} onChange={e => handleInstallmentChange(p.id, 'amount', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(p.amount)}</p>}
                              </div>
                              <div>
                                  <p className="text-muted-foreground">Next Due Date</p>
                                  <p className="font-medium">{formattedDueDate} ({p.frequency})</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Est. Completion</p>
                                <p className="font-medium">{calculateCompletionDate(p)}</p>
                              </div>
                          </div>
                      </div>)
                  })}
                </div>
              </div>
              
              <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Loans</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsAddLoanDialogOpen(true)}>Add Loan</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loans.map(l => {
                      const progress = l.initial > 0 ? ((l.initial - l.remaining) / l.initial) * 100 : 0;
                      return (
                      <div key={l.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'loan', id: l.id })}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          )}
                          <div className="flex justify-between items-center">
                              <p className="font-bold">{l.lender} Loan</p>
                              <span className="text-sm font-semibold text-green-700">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="my-2 h-2" />
                          <div className="grid grid-cols-2 text-sm gap-2 mt-2">
                               <div>
                                  <label className="text-xs font-medium">Initial Amount ({l.currency})</label>
                                  {isEditing ? <Input type="number" defaultValue={l.initial} onChange={e => handleLoanChange(l.id, 'initial', e.target.value)} className="h-8"/> : <p className="font-medium">{formatNumber(l.initial)}</p>}
                              </div>
                              <div>
                                  <label className="text-xs font-medium">Remaining ({l.currency})</label>
                                  {isEditing ? <Input type="number" defaultValue={l.remaining} onChange={e => handleLoanChange(l.id, 'remaining', e.target.value)} className="h-8"/> : <p className="font-medium text-destructive">{formatNumber(l.remaining)}</p>}
                              </div>
                              <div>
                                  <label className="text-xs font-medium">Monthly Payment ({l.currency})</label>
                                  {isEditing ? <Input type="number" defaultValue={l.monthlyPayment} onChange={e => handleLoanChange(l.id, 'monthlyPayment', e.target.value)} className="h-8"/> : <p className="font-medium">{l.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>}
                              </div>
                          </div>
                      </div>)
                  })}
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
      <AddLiabilityDialog
        isOpen={isAddLoanDialogOpen}
        onClose={() => setIsAddLoanDialogOpen(false)}
        onAddLiability={handleAddLoan}
      />
      <AddInstallmentDialog
        isOpen={isAddInstallmentDialogOpen}
        onClose={() => setIsAddInstallmentDialogOpen(false)}
        onAddInstallment={handleAddInstallment}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this liability from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
