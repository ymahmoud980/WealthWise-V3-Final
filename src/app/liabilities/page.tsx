"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Loan, Installment, PaymentRecord } from "@/lib/types";
import { Trash2, Landmark, Building, CalendarClock, AlertCircle, FolderOpen, ScrollText, StickyNote, Plus, X, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog";
import { AddInstallmentDialog } from "@/components/liabilities/AddInstallmentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GlassInput = (props: any) => (
  <Input {...props} className={cn("bg-black/20 border-white/10 text-foreground focus:ring-destructive/50 h-8", props.className)} 
  />
);

export default function LiabilitiesPage() {
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);
  const [isAddLoanDialogOpen, setIsAddLoanDialogOpen] = useState(false);
  const [isAddInstallmentDialogOpen, setIsAddInstallmentDialogOpen] = useState(false);
  
  const [activeHistory, setActiveHistory] = useState<Installment | null>(null);
  const [newPayment, setNewPayment] = useState({ date: "", amount: "", desc: "" });
  const [newScheduleItem, setNewScheduleItem] = useState({ date: "", amount: "", desc: "" }); // New state for schedule

  const handleEditClick = () => { setEditableData(JSON.parse(JSON.stringify(data))); setIsEditing(true); };
  const handleSaveClick = () => { setData(editableData); setIsEditing(false); };
  const handleCancelClick = () => { setEditableData(JSON.parse(JSON.stringify(data))); setIsEditing(false); };

  // --- PAID HISTORY LOGIC ---
  const handleAddPayment = () => {
    if (!activeHistory || !newPayment.amount) return;
    const amount = parseFloat(newPayment.amount);
    const newRecord: PaymentRecord = { id: `pay${Date.now()}`, date: newPayment.date, amount: amount, description: newPayment.desc };
    const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
    const inst = newData.liabilities.installments.find((i:any) => i.id === activeHistory.id);
    if (inst) {
        if (!inst.paymentHistory) inst.paymentHistory = [];
        inst.paymentHistory.push(newRecord);
        inst.paid = inst.paymentHistory.reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);
        if (isEditing) setEditableData(newData); else setData(newData);
        setActiveHistory(inst);
        setNewPayment({ date: "", amount: "", desc: "" });
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!activeHistory) return;
    const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
    const inst = newData.liabilities.installments.find((i:any) => i.id === activeHistory.id);
    if (inst) {
        inst.paymentHistory = inst.paymentHistory.filter((p: PaymentRecord) => p.id !== paymentId);
        inst.paid = inst.paymentHistory.reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);
        if (isEditing) setEditableData(newData); else setData(newData);
        setActiveHistory(inst);
    }
  };

  // --- FUTURE SCHEDULE LOGIC (NEW) ---
  const handleAddSchedule = () => {
    if (!activeHistory || !newScheduleItem.amount) return;
    const amount = parseFloat(newScheduleItem.amount);
    const newRecord: PaymentRecord = { id: `sch${Date.now()}`, date: newScheduleItem.date, amount: amount, description: newScheduleItem.desc };
    
    const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
    const inst = newData.liabilities.installments.find((i:any) => i.id === activeHistory.id);
    if(inst) {
        if(!inst.schedule) inst.schedule = [];
        inst.schedule.push(newRecord);
        // Sort by date
        inst.schedule.sort((a:any,b:any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Update Next Due automatically
        const next = inst.schedule.find((s:any) => new Date(s.date) >= new Date());
        if(next) { inst.nextDueDate = next.date; inst.amount = next.amount; }

        if (isEditing) setEditableData(newData); else setData(newData);
        setActiveHistory(inst);
        setNewScheduleItem({ date: "", amount: "", desc: "" });
    }
  };

  const handleDeleteSchedule = (id: string) => {
      if (!activeHistory) return;
      const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
      const inst = newData.liabilities.installments.find((i:any) => i.id === activeHistory.id);
      if(inst && inst.schedule) {
          inst.schedule = inst.schedule.filter((s:any) => s.id !== id);
          if (isEditing) setEditableData(newData); else setData(newData);
          setActiveHistory(inst);
      }
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const currentData = isEditing ? editableData : data;
  const { loans, installments } = currentData.liabilities;
  const groupedInstallments: Record<string, Installment[]> = {};
  installments.forEach(inst => { const groupName = inst.developer || inst.project || "Other"; if (!groupedInstallments[groupName]) groupedInstallments[groupName] = []; groupedInstallments[groupName].push(inst); });

  // ... (Keep handleInstallmentChange, handleLoanChange, handleDeleteConfirm, handleAddLoan, handleAddInstallment - Omitted for brevity, paste them from previous file if needed, but the return logic below is complete) ...
  const handleInstallmentChange = (id: string, key: string, value: string) => { const newData = { ...editableData }; const inst = newData.liabilities.installments.find(i => i.id === id); if(inst) { (inst as any)[key] = ['notes','nextDueDate'].includes(key) ? value : (parseFloat(value)||0); setEditableData(newData); } };
  const handleLoanChange = (id: string, key: string, value: string) => { const newData = { ...editableData }; const loan = newData.liabilities.loans.find(l => l.id === id); if(loan) { (loan as any)[key] = key === 'notes' ? value : (parseFloat(value)||0); setEditableData(newData); } };
  const handleDeleteConfirm = () => { if (!deleteTarget) return; const updatedData = JSON.parse(JSON.stringify(data)); if (deleteTarget.type === 'installment') updatedData.liabilities.installments = updatedData.liabilities.installments.filter((item: any) => item.id !== deleteTarget.id); else updatedData.liabilities.loans = updatedData.liabilities.loans.filter((item: any) => item.id !== deleteTarget.id); setData(updatedData); setDeleteTarget(null); };
  const handleAddLoan = (newLoan: any) => { const fullLoan = { ...newLoan, id: `l${Date.now()}` }; const updatedData = JSON.parse(JSON.stringify(data)); updatedData.liabilities.loans.push(fullLoan); setData(updatedData); setIsAddLoanDialogOpen(false); }
  const handleAddInstallment = (newInstallment: any) => { const fullInstallment = { ...newInstallment, id: `i${Date.now()}` }; const updatedData = JSON.parse(JSON.stringify(data)); updatedData.liabilities.installments.push(fullInstallment); setData(updatedData); setIsAddInstallmentDialogOpen(false); }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center glass-panel p-6 rounded-xl border-l-4 border-rose-600 shadow-lg"><div><h1 className="text-3xl font-bold text-white">Liabilities & Debts</h1><p className="text-muted-foreground">Outstanding Loans & Payment Plans</p></div><div className="flex gap-2"><Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSaveClick : handleEditClick} className={isEditing ? "bg-blue-600" : "border-white/10"}>{isEditing ? "Save Changes" : "Edit Mode"}</Button>{isEditing && <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>}</div></div>

      <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-white/10 pb-2"><h3 className="text-xl font-semibold flex items-center gap-2 text-white"><Building className="text-rose-500 h-5 w-5"/> Project Installments</h3><Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-500/10" onClick={() => setIsAddInstallmentDialogOpen(true)}>+ Add</Button></div>
             {Object.entries(groupedInstallments).map(([projectGroup, projectInstallments]) => (
                <div key={projectGroup} className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2 pl-1 uppercase tracking-wider"><FolderOpen className="h-4 w-4" /> {projectGroup}</h4>
                    {projectInstallments.map(p => {
                        const parentAsset = data.assets.underDevelopment.find((a: any) => a.linkedInstallmentId === p.id);
                        const calculatedTotal = parentAsset ? (Number(parentAsset.purchasePrice) || 0) + (Number(parentAsset.maintenanceCost) || 0) + (Number(parentAsset.parkingCost) || 0) : p.total;
                        const progress = calculatedTotal > 0 ? (p.paid / calculatedTotal) * 100 : 0;
                        
                        return (
                        <div key={p.id} className="glass-panel p-5 rounded-xl relative group border-l-4 border-l-rose-500 bg-black/20">
                            <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-lg text-white">{p.project}</h4><p className="text-xs text-muted-foreground">{p.developer}</p></div><div className="text-right"><div className="text-xs uppercase text-muted-foreground">Paid</div><div className="font-mono font-bold text-emerald-400">{progress.toFixed(1)}%</div></div></div>
                            <Progress value={progress} className="h-2 bg-white/10 mb-4" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Total Cost</label><p className="font-mono text-white opacity-80">{formatNumber(calculatedTotal)} {p.currency}</p></div>
                                <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Outstanding</label><p className="font-mono font-bold text-rose-400">{formatNumber(calculatedTotal - p.paid)}</p></div>
                                <div className="col-span-2 pt-2"><div className="flex justify-between items-center bg-white/5 p-2 rounded"><div><span className="text-[10px] text-muted-foreground block">TOTAL PAID</span><span className="font-bold text-emerald-400">{formatNumber(p.paid)}</span></div><Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs" onClick={() => setActiveHistory(p)}><ScrollText className="h-3 w-3 mr-1" /> Manage Payments</Button></div></div>
                                <div className="space-y-1 mt-1 col-span-2"><div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Next Installment</span><div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">{p.nextDueDate}</span>{isEditing ? <GlassInput type="number" className="w-24 text-right" defaultValue={p.amount} onChange={(e: any) => handleInstallmentChange(p.id, 'amount', e.target.value)}/> : <span className="font-mono font-bold text-rose-300">{formatNumber(p.amount)}</span>}</div></div></div>
                                {(p.notes || isEditing) && (<div className="col-span-2 bg-rose-500/10 p-2 rounded border border-rose-500/20 mt-2"><label className="text-[10px] text-rose-400 flex items-center gap-1"><StickyNote className="h-3 w-3"/> Notes</label>{isEditing ? <textarea className="w-full bg-transparent text-xs text-white border-0 focus:ring-0 p-0" rows={2} value={p.notes || ""} onChange={(e) => handleInstallmentChange(p.id, 'notes', e.target.value)} placeholder="Add private notes..." /> : <p className="text-xs text-slate-300 italic">{p.notes}</p>}</div>)}
                            </div>
                            {isEditing && <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'installment', id: p.id })}><Trash2 className="h-4 w-4" /></Button>}
                        </div>)
                    })}
                </div>
             ))}
          </div>
          <div className="space-y-6"><div className="flex justify-between items-center border-b border-white/10 pb-2"><h3 className="text-xl font-semibold flex items-center gap-2 text-white"><Landmark className="text-amber-500 h-5 w-5"/> Bank Loans</h3><Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-500/10" onClick={() => setIsAddLoanDialogOpen(true)}>+ Add</Button></div><div className="space-y-4">{loans.map(l => (<div key={l.id} className="glass-panel p-5 rounded-xl border-l-4 border-l-amber-500 bg-black/20"><div className="flex justify-between items-center mb-3"><p className="font-bold text-lg text-white">{l.lender}</p><span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded">Active Loan</span></div><div className="grid grid-cols-2 gap-4 text-sm mt-2"><div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Original Loan</label>{isEditing ? <GlassInput type="number" defaultValue={l.initial} onChange={(e: any) => handleLoanChange(l.id, 'initial', e.target.value)}/> : <p className="font-mono text-slate-300">{formatNumber(l.initial)} {l.currency}</p>}</div><div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Remaining Debt</label>{isEditing ? <GlassInput type="number" defaultValue={l.remaining} onChange={(e: any) => handleLoanChange(l.id, 'remaining', e.target.value)}/> : <p className="font-mono font-bold text-rose-400 text-lg">{formatNumber(l.remaining)}</p>}</div></div>{isEditing && <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'loan', id: l.id })}><Trash2 className="h-4 w-4" /></Button>}</div>))}</div></div>
      </div>

      <Dialog open={!!activeHistory} onOpenChange={() => setActiveHistory(null)}>
        <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-[500px]"><DialogHeader><DialogTitle>Plan: {activeHistory?.project}</DialogTitle></DialogHeader>
            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/40"><TabsTrigger value="schedule">Future Schedule</TabsTrigger><TabsTrigger value="history">Paid History</TabsTrigger></TabsList>
                
                {/* FUTURE SCHEDULE TAB */}
                <TabsContent value="schedule" className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto space-y-2">
                        {activeHistory?.schedule && activeHistory.schedule.length > 0 ? (activeHistory.schedule.map((rec: PaymentRecord) => (
                            <div key={rec.id} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5"><div><p className="text-sm font-bold text-white">{formatNumber(rec.amount)}</p><p className="text-[10px] text-muted-foreground">{rec.date} • {rec.description}</p></div><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteSchedule(rec.id)}><X className="h-3 w-3"/></Button></div>
                        ))) : <p className="text-center text-sm text-muted-foreground">No future schedule.</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                        <Input type="date" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.date} onChange={e => setNewScheduleItem({...newScheduleItem, date: e.target.value})} />
                        <Input placeholder="Amount" type="number" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.amount} onChange={e => setNewScheduleItem({...newScheduleItem, amount: e.target.value})} />
                        <Input placeholder="Desc" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.desc} onChange={e => setNewScheduleItem({...newScheduleItem, desc: e.target.value})} />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddSchedule}><Plus className="h-4 w-4 mr-2"/> Add to Schedule</Button>
                </TabsContent>

                {/* PAID HISTORY TAB */}
                <TabsContent value="history" className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto space-y-2">
                        {activeHistory?.paymentHistory && activeHistory.paymentHistory.length > 0 ? (activeHistory.paymentHistory.map((rec: PaymentRecord) => (
                            <div key={rec.id} className="flex justify-between items-center p-2 bg-emerald-900/10 border border-emerald-500/20 rounded"><div><p className="text-sm font-bold text-emerald-400">{formatNumber(rec.amount)}</p><p className="text-[10px] text-muted-foreground">{rec.date} • {rec.description}</p></div><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleDeletePayment(rec.id)}><X className="h-3 w-3"/></Button></div>
                        ))) : <p className="text-center text-sm text-muted-foreground">No payments recorded yet.</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                        <Input type="date" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} />
                        <Input placeholder="Amount" type="number" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
                        <Input placeholder="Desc" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.desc} onChange={e => setNewPayment({...newPayment, desc: e.target.value})} />
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddPayment}><Plus className="h-4 w-4 mr-2"/> Add Paid Record</Button>
                </TabsContent>
            </Tabs>
        </DialogContent>
      </Dialog>
      <AddLiabilityDialog isOpen={isAddLoanDialogOpen} onClose={() => setIsAddLoanDialogOpen(false)} onAddLiability={handleAddLoan} />
      <AddInstallmentDialog isOpen={isAddInstallmentDialogOpen} onClose={() => setIsAddInstallmentDialogOpen(false)} onAddInstallment={handleAddInstallment} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}><AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Delete Liability?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteConfirm}>Confirm Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}