"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Loan, Installment } from "@/lib/types";
import { Trash2, Landmark, Building, CalendarClock, AlertCircle, FolderOpen, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog";
import { AddInstallmentDialog } from "@/components/liabilities/AddInstallmentDialog";
import { format, isValid, addMonths, addYears } from "date-fns";
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

  useEffect(() => {
    if (!isEditing) {
        setEditableData(JSON.parse(JSON.stringify(data)));
    }
  }, [data, isEditing]);

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

  const handleLoanChange = (id: string, key: keyof Loan, value: string) => {
    const newData = JSON.parse(JSON.stringify(editableData));
    const loan = newData.liabilities.loans.find((l: Loan) => l.id === id);
    if (loan) {
      if (key === 'lender' || key === 'currency') {
          (loan[key] as any) = value; 
      } else {
          (loan[key] as any) = parseFloat(value) || 0; 
      }
      setEditableData(newData);
    }
  };

  const handleInstallmentChange = (id: string, key: keyof Installment, value: string) => {
    const newData = JSON.parse(JSON.stringify(editableData));
    const installment = newData.liabilities.installments.find((i: Installment) => i.id === id);
    if (installment) {
      if (key === 'project' || key === 'developer' || key === 'currency') {
          (installment[key] as any) = value; 
      } else {
          (installment[key] as any) = parseFloat(value) || 0; 
      }
      setEditableData(newData);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    
    const updatedEditable = JSON.parse(JSON.stringify(editableData));
    if (type === 'installment') {
        updatedEditable.liabilities.installments = updatedEditable.liabilities.installments.filter((item: any) => item.id !== id);
    } else if (type === 'loan') {
        updatedEditable.liabilities.loans = updatedEditable.liabilities.loans.filter((item: any) => item.id !== id);
    }
    setEditableData(updatedEditable);
    setData(updatedEditable);
    
    setDeleteTarget(null);
  };
  
  const handleAddLoan = (newLoan: Omit<Loan, 'id'>) => {
    const fullLoan: Loan = { ...newLoan, id: `l${new Date().getTime()}` };
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.liabilities.loans.push(fullLoan);
    setData(updatedData);
    setEditableData(updatedData); 
    setIsAddLoanDialogOpen(false);
  }
  
  const handleAddInstallment = (newInstallment: Omit<Installment, 'id'>) => {
    const fullInstallment: Installment = { ...newInstallment, id: `i${new Date().getTime()}` };
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.liabilities.installments.push(fullInstallment);
    setData(updatedData);
    setEditableData(updatedData); 
    setIsAddInstallmentDialogOpen(false);
  }

  const formatNumber = (num: number) => num.toLocaleString();
  
  const currentData = isEditing ? editableData : data;
  const { loans, installments } = currentData.liabilities;

  const groupedInstallments: Record<string, Installment[]> = {};
  installments.forEach(inst => {
    const groupName = inst.developer || inst.project || "Other Projects";
    if (!groupedInstallments[groupName]) groupedInstallments[groupName] = [];
    groupedInstallments[groupName].push(inst);
  });

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center glass-panel p-6 rounded-xl border-l-4 border-rose-600 shadow-lg shadow-rose-900/10">
          <div>
              <h1 className="text-3xl font-bold text-white">Liabilities & Debts</h1>
              <p className="text-muted-foreground">Track outstanding loans and project installments.</p>
          </div>
          <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveClick}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleEditClick} className="border-white/10 hover:bg-white/5">Edit Mode</Button>
              )}
          </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          
          {/* --- PROJECT INSTALLMENTS --- */}
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Building className="text-rose-500 h-6 w-6"/> Project Installments
                </h3>
                <Button 
                    className="bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/50 shadow-lg shadow-rose-900/20" 
                    size="sm" 
                    onClick={() => setIsAddInstallmentDialogOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Installment
                </Button>
             </div>
             
             {Object.entries(groupedInstallments).map(([projectGroup, projectInstallments]) => (
                <div key={projectGroup} className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2 pl-1 uppercase tracking-wider">
                        <FolderOpen className="h-4 w-4" /> {projectGroup}
                    </h4>
                    {projectInstallments.map(p => {
                        const progress = (p.paid / p.total) * 100;
                        const remaining = p.total - p.paid;
                        
                        // Parse Date Logic (Moved inline to keep render clean)
                        let formattedDueDate = "Invalid Date";
                        if (p.nextDueDate) {
                            const parts = p.nextDueDate.split('-');
                            if(parts.length === 3) {
                                const d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                                if(isValid(d)) formattedDueDate = format(d, 'MMM d, yyyy');
                            }
                        }
                        
                        return (
                        <div key={p.id} className="glass-panel p-5 rounded-xl relative group border-l-4 border-l-rose-500 hover:border-rose-400 transition-all shadow-md bg-black/20">
                            {isEditing && (
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'installment', id: p.id })}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    {isEditing ? (
                                        <GlassInput 
                                            value={p.project} 
                                            onChange={(e: any) => handleInstallmentChange(p.id, 'project', e.target.value)}
                                            className="font-bold text-lg mb-1"
                                        />
                                    ) : (
                                        <h4 className="font-bold text-lg text-white">{p.project}</h4>
                                    )}
                                    {isEditing ? (
                                        <GlassInput 
                                            value={p.developer} 
                                            onChange={(e: any) => handleInstallmentChange(p.id, 'developer', e.target.value)}
                                            className="h-6 text-xs w-1/2"
                                        />
                                    ) : (
                                        <p className="text-xs text-muted-foreground">{p.developer}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase text-muted-foreground">Paid</div>
                                    <div className="font-mono font-bold text-emerald-400">{progress.toFixed(0)}%</div>
                                </div>
                            </div>
                            
                            {/* FIX: Removed invalid 'indicatorClassName'. Used child selector [&>*] to color the bar Green */}
                            <Progress value={progress} className="h-2 bg-white/10 mb-4 [&>*]:bg-emerald-500" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground">Total Cost</label>
                                    {isEditing ? <GlassInput type="number" defaultValue={p.total} onChange={(e: any) => handleInstallmentChange(p.id, 'total', e.target.value)}/> : <p className="font-mono">{formatNumber(p.total)} <span className="text-xs text-muted-foreground">{p.currency}</span></p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground">Outstanding</label>
                                    <p className="font-mono font-bold text-rose-400">{formatNumber(remaining)}</p>
                                </div>
                                <div className="space-y-1 bg-white/5 p-2 rounded md:col-span-2 flex justify-between items-center mt-1">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">Next Payment</p>
                                        <div className="flex items-center gap-2">
                                            <CalendarClock className="h-3 w-3 text-rose-400" />
                                            <span className="text-xs text-white">{formattedDueDate}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {isEditing ? <GlassInput type="number" className="w-24 text-right" defaultValue={p.amount} onChange={(e: any) => handleInstallmentChange(p.id, 'amount', e.target.value)}/> : <span className="font-mono font-bold text-lg text-rose-300">{formatNumber(p.amount)}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>)
                    })}
                </div>
             ))}
          </div>
          
          {/* --- BANK LOANS --- */}
          <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Landmark className="text-amber-500 h-6 w-6"/> Bank Loans
                </h3>
                <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500/50 shadow-lg shadow-amber-900/20" 
                    size="sm" 
                    onClick={() => setIsAddLoanDialogOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Loan
                </Button>
              </div>
              
              <div className="space-y-4">
              {loans.map(l => {
                  const progress = l.initial > 0 ? ((l.initial - l.remaining) / l.initial) * 100 : 0;
                  return (
                  <div key={l.id} className="glass-panel p-5 rounded-xl relative border-l-4 border-l-amber-500 bg-black/20 shadow-md">
                      {isEditing && (
                          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'loan', id: l.id })}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
                      <div className="flex justify-between items-center mb-3">
                          {isEditing ? (
                              <GlassInput 
                                value={l.lender} 
                                onChange={(e: any) => handleLoanChange(l.id, 'lender', e.target.value)}
                                className="font-bold text-lg w-full"
                              />
                          ) : (
                              <p className="font-bold text-lg text-white">{l.lender}</p>
                          )}
                          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">{progress.toFixed(1)}% Paid</span>
                      </div>
                      
                      {/* FIX: Removed invalid 'indicatorClassName'. Used child selector [&>*] to color the bar Amber */}
                      <Progress value={progress} className="h-1.5 bg-white/10 mb-4 [&>*]:bg-amber-500" />

                      <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase text-muted-foreground">Original Loan</label>
                              {isEditing ? <GlassInput type="number" defaultValue={l.initial} onChange={(e: any) => handleLoanChange(l.id, 'initial', e.target.value)}/> : <p className="font-mono text-slate-300">{formatNumber(l.initial)} {l.currency}</p>}
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] uppercase text-muted-foreground">Remaining Debt</label>
                              {isEditing ? <GlassInput type="number" defaultValue={l.remaining} onChange={(e: any) => handleLoanChange(l.id, 'remaining', e.target.value)}/> : <p className="font-mono font-bold text-rose-400 text-lg">{formatNumber(l.remaining)}</p>}
                          </div>
                          <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">Monthly Repayment</span>
                              {isEditing ? <GlassInput className="w-32 text-right" type="number" defaultValue={l.monthlyPayment} onChange={(e: any) => handleLoanChange(l.id, 'monthlyPayment', e.target.value)}/> : <p className="font-mono font-medium text-rose-300">-{l.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })} {l.currency}</p>}
                          </div>
                      </div>
                  </div>)
              })}
              </div>
          </div>
      </div>

      <AddLiabilityDialog isOpen={isAddLoanDialogOpen} onClose={() => setIsAddLoanDialogOpen(false)} onAddLiability={handleAddLoan} />
      <AddInstallmentDialog isOpen={isAddInstallmentDialogOpen} onClose={() => setIsAddInstallmentDialogOpen(false)} onAddInstallment={handleAddInstallment} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Delete Liability?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this debt record.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteConfirm}>Confirm Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}