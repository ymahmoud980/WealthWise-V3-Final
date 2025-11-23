"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Loan, Installment } from "@/lib/types";
import { LiabilityUploader } from "@/components/liabilities/LiabilityUploader";
import { Trash2, Landmark, Building, CalendarClock, AlertCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";

const GlassInput = (props: any) => (
  <Input 
    {...props} 
    className={cn("bg-black/20 border-white/10 text-foreground focus:ring-destructive/50 h-8", props.className)} 
  />
);

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
      (loan[key] as any) = numericValue;
      setEditableData(newData);
    }
  };

  const handleInstallmentChange = (id: string, key: 'total' | 'paid' | 'amount', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const installment = newData.liabilities.installments.find(i => i.id === id);
    if (installment) {
      (installment[key] as any) = numericValue;
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
    const fullLoan: Loan = { ...newLoan, id: `l${new Date().getTime()}` };
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.liabilities.loans.push(fullLoan);
    setData(updatedData);
    setIsAddLoanDialogOpen(false);
  }
  
  const handleAddInstallment = (newInstallment: Omit<Installment, 'id'>) => {
    const fullInstallment: Installment = { ...newInstallment, id: `i${new Date().getTime()}` };
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.liabilities.installments.push(fullInstallment);
    setData(updatedData);
    setIsAddInstallmentDialogOpen(false);
  }

  const formatNumber = (num: number) => num.toLocaleString();
  
  const calculateCompletionDate = (p: Installment) => {
      const remaining = p.total - p.paid;
      if (remaining <= 0 || p.amount <= 0) return "Completed";
      const paymentsRemaining = Math.ceil(remaining / p.amount);
      const dateParts = p.nextDueDate.split('-').map(part => parseInt(part, 10));
      const dueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      if (!isValid(dueDate)) return "Invalid Date";
      let completionDate;
      if (p.frequency === 'Quarterly') completionDate = addMonths(dueDate, (paymentsRemaining -1) * 3);
      else if (p.frequency === 'Semi-Annual') completionDate = addMonths(dueDate, (paymentsRemaining - 1) * 6);
      else if (p.frequency === 'Annual') completionDate = addYears(dueDate, paymentsRemaining - 1);
      else return "Unknown";
      return format(completionDate, 'MMM yyyy');
  }

  const currentData = isEditing ? editableData : data;
  const { loans, installments } = currentData.liabilities;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
          <div>
              <h1 className="text-3xl font-bold text-foreground">Liabilities & Debts</h1>
              <p className="text-muted-foreground">Track outstanding loans and project installments.</p>
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

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Installments Column */}
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Building className="text-primary h-5 w-5"/> Project Installments</h3>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => setIsAddInstallmentDialogOpen(true)}>+ Add</Button>
             </div>
             
             <div className="space-y-4">
                {installments.map(p => {
                    const progress = (p.paid / p.total) * 100;
                    const remaining = p.total - p.paid;
                    const dateParts = p.nextDueDate.split('-').map(part => parseInt(part, 10));
                    const nextDueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                    const formattedDueDate = isValid(nextDueDate) ? format(nextDueDate, 'MMM d, yyyy') : 'Invalid Date';
                    
                    return (
                    <div key={p.id} className="glass-panel p-5 rounded-xl relative group border-l-4 border-l-primary">
                        {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'installment', id: p.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-lg">{p.project}</h4>
                              <p className="text-xs text-muted-foreground">{p.developer}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase text-muted-foreground">Completion</div>
                                <div className="font-mono font-bold text-primary">{progress.toFixed(0)}%</div>
                            </div>
                        </div>
                        
                        <Progress value={progress} className="h-1.5 bg-white/10 mb-4" />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-muted-foreground">Total Cost</label>
                                {isEditing ? <GlassInput type="number" defaultValue={p.total} onChange={(e: any) => handleInstallmentChange(p.id, 'total', e.target.value)}/> : <p className="font-mono">{formatNumber(p.total)} <span className="text-xs text-muted-foreground">{p.currency}</span></p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-muted-foreground">Paid So Far</label>
                                {isEditing ? <GlassInput type="number" defaultValue={p.paid} onChange={(e: any) => handleInstallmentChange(p.id, 'paid', e.target.value)}/> : <p className="font-mono text-emerald-400">{formatNumber(p.paid)}</p>}
                            </div>
                            <div className="space-y-1 col-span-2 pt-2 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Outstanding Balance</span>
                                    <span className="font-mono text-lg font-bold text-rose-400">{formatNumber(remaining)} {p.currency}</span>
                                </div>
                            </div>
                            <div className="space-y-1 bg-black/20 p-2 rounded md:col-span-2 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Next Payment</p>
                                    <div className="flex items-center gap-2">
                                        <CalendarClock className="h-3 w-3 text-primary" />
                                        <span className="text-xs">{formattedDueDate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {isEditing ? <GlassInput type="number" className="w-24 text-right" defaultValue={p.amount} onChange={(e: any) => handleInstallmentChange(p.id, 'amount', e.target.value)}/> : <span className="font-mono font-bold">{formatNumber(p.amount)}</span>}
                                </div>
                            </div>
                        </div>
                    </div>)
                })}
             </div>
          </div>
          
          {/* Loans Column */}
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Landmark className="text-rose-500 h-5 w-5"/> Bank Loans</h3>
                <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-500/10" onClick={() => setIsAddLoanDialogOpen(true)}>+ Add</Button>
              </div>
              
              <div className="space-y-4">
              {loans.map(l => {
                  const progress = l.initial > 0 ? ((l.initial - l.remaining) / l.initial) * 100 : 0;
                  return (
                  <div key={l.id} className="glass-panel p-5 rounded-xl relative border-l-4 border-l-rose-500">
                      {isEditing && (
                          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'loan', id: l.id })}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
                      <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-lg">{l.lender}</p>
                          <span className="text-xs font-mono bg-rose-500/10 text-rose-400 px-2 py-1 rounded">{progress.toFixed(1)}% Paid</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase text-muted-foreground">Original Loan</label>
                              {isEditing ? <GlassInput type="number" defaultValue={l.initial} onChange={(e: any) => handleLoanChange(l.id, 'initial', e.target.value)}/> : <p className="font-mono">{formatNumber(l.initial)} {l.currency}</p>}
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] uppercase text-muted-foreground">Remaining</label>
                              {isEditing ? <GlassInput type="number" defaultValue={l.remaining} onChange={(e: any) => handleLoanChange(l.id, 'remaining', e.target.value)}/> : <p className="font-mono font-bold text-rose-400">{formatNumber(l.remaining)}</p>}
                          </div>
                          <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Monthly Payment</span>
                              {isEditing ? <GlassInput className="w-32 text-right" type="number" defaultValue={l.monthlyPayment} onChange={(e: any) => handleLoanChange(l.id, 'monthlyPayment', e.target.value)}/> : <p className="font-mono font-medium text-rose-300">-{l.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })} {l.currency}</p>}
                          </div>
                      </div>
                  </div>)
              })}
              </div>
          </div>
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
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Liability?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this debt record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeleteConfirm}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}