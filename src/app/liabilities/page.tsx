"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import { useCurrency } from "@/hooks/use-currency";
import type { FinancialData, Loan, Installment, PaymentRecord } from "@/lib/types";
import { Trash2, Landmark, Building, CalendarClock, AlertCircle, FolderOpen, ScrollText, StickyNote, Plus, X, Calendar, TrendingDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog";
import { AddInstallmentDialog } from "@/components/liabilities/AddInstallmentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const GlassInput = (props: any) => (
    <Input {...props} className={cn("bg-black/20 border-white/10 text-foreground focus:ring-destructive/50 h-8", props.className)}
    />
);

export default function LiabilitiesPage() {
    const { data, setData, metrics } = useFinancialData();
    const { currency } = useCurrency();
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));
    const [deleteTarget, setDeleteTarget] = useState<{ type: string, id: string } | null>(null);
    const [isAddLoanDialogOpen, setIsAddLoanDialogOpen] = useState(false);
    const [isAddInstallmentDialogOpen, setIsAddInstallmentDialogOpen] = useState(false);

    const [activeHistory, setActiveHistory] = useState<Installment | null>(null);
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", desc: "" });
    const [newScheduleItem, setNewScheduleItem] = useState({ date: "", amount: "", desc: "" });

    const handleEditClick = () => { setEditableData(JSON.parse(JSON.stringify(data))); setIsEditing(true); };
    const handleSaveClick = () => { setData(editableData); setIsEditing(false); };
    const handleCancelClick = () => { setEditableData(JSON.parse(JSON.stringify(data))); setIsEditing(false); };

    const handleMarkScheduleAsPaid = (scheduleId: string) => {
        if (!activeHistory) return;
        const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
        const instIdx = newData.liabilities.installments.findIndex((i: any) => i.id === activeHistory.id);
        if (instIdx > -1) {
            const inst = newData.liabilities.installments[instIdx];
            const itemIndex = inst.schedule.findIndex((s: any) => s.id === scheduleId);
            if (itemIndex === -1) return;
            const item = inst.schedule[itemIndex];
            if (!inst.paymentHistory) inst.paymentHistory = [];
            inst.paymentHistory.push({ ...item, id: `pay_moved_${Date.now()}`, description: item.description + " (Paid)" });
            inst.schedule.splice(itemIndex, 1);
            inst.paid = inst.paymentHistory.reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);
            inst.schedule.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            if (inst.schedule.length > 0) { inst.nextDueDate = inst.schedule[0].date; inst.amount = inst.schedule[0].amount; }
            else { inst.nextDueDate = "Completed"; inst.amount = 0; }
            if (isEditing) setEditableData(newData); else setData(newData);
            setActiveHistory(inst);
        }
    };

    const handleAddPayment = () => {
        if (!activeHistory || !newPayment.amount) return;
        const amount = parseFloat(newPayment.amount);
        const newRecord: PaymentRecord = { id: `pay${Date.now()}`, date: newPayment.date, amount: amount, description: newPayment.desc };
        const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
        const instIdx = newData.liabilities.installments.findIndex((i: any) => i.id === activeHistory.id);
        if (instIdx > -1) {
            const inst = newData.liabilities.installments[instIdx];
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
        const instIdx = newData.liabilities.installments.findIndex((i: any) => i.id === activeHistory.id);
        if (instIdx > -1) {
            const inst = newData.liabilities.installments[instIdx];
            inst.paymentHistory = inst.paymentHistory.filter((p: PaymentRecord) => p.id !== paymentId);
            inst.paid = inst.paymentHistory.reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);
            if (isEditing) setEditableData(newData); else setData(newData);
            setActiveHistory(inst);
        }
    };

    const handleAddSchedule = () => {
        if (!activeHistory || !newScheduleItem.amount) return;
        const amount = parseFloat(newScheduleItem.amount);
        const newRecord: PaymentRecord = { id: `sch${Date.now()}`, date: newScheduleItem.date, amount: amount, description: newScheduleItem.desc };
        const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
        const inst = newData.liabilities.installments.find((i: any) => i.id === activeHistory.id);
        if (inst) {
            if (!inst.schedule) inst.schedule = [];
            inst.schedule.push(newRecord);
            inst.schedule.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const next = inst.schedule.find((s: any) => new Date(s.date) >= new Date());
            if (next) { inst.nextDueDate = next.date; inst.amount = next.amount; }
            if (isEditing) setEditableData(newData); else setData(newData);
            setActiveHistory(inst);
            setNewScheduleItem({ date: "", amount: "", desc: "" });
        }
    };

    const handleDeleteSchedule = (id: string) => {
        if (!activeHistory) return;
        const newData = JSON.parse(JSON.stringify(isEditing ? editableData : data));
        const inst = newData.liabilities.installments.find((i: any) => i.id === activeHistory.id);
        if (inst && inst.schedule) {
            inst.schedule = inst.schedule.filter((s: any) => s.id !== id);
            if (isEditing) setEditableData(newData); else setData(newData);
            setActiveHistory(inst);
        }
    };

    const formatNumber = (num: number) => num.toLocaleString();
    const currentData = isEditing ? editableData : data;
    const { loans, installments } = currentData.liabilities;
    const groupedInstallments: Record<string, Installment[]> = {};
    installments.forEach(inst => { const groupName = inst.developer || inst.project || "Other"; if (!groupedInstallments[groupName]) groupedInstallments[groupName] = []; groupedInstallments[groupName].push(inst); });

    const handleInstallmentChange = (id: string, key: string, value: string) => { const newData = { ...editableData }; const inst = newData.liabilities.installments.find(i => i.id === id); if (inst) { (inst as any)[key] = ['notes', 'nextDueDate'].includes(key) ? value : (parseFloat(value) || 0); setEditableData(newData); } };
    const handleLoanChange = (id: string, key: string, value: string) => { const newData = { ...editableData }; const loan = newData.liabilities.loans.find(l => l.id === id); if (loan) { (loan as any)[key] = key === 'notes' ? value : (parseFloat(value) || 0); setEditableData(newData); } };
    const handleDeleteConfirm = () => { if (!deleteTarget) return; const updatedData = JSON.parse(JSON.stringify(data)); if (deleteTarget.type === 'installment') updatedData.liabilities.installments = updatedData.liabilities.installments.filter((item: any) => item.id !== deleteTarget.id); else updatedData.liabilities.loans = updatedData.liabilities.loans.filter((item: any) => item.id !== deleteTarget.id); setData(updatedData); setDeleteTarget(null); };
    const handleAddLoan = (newLoan: any) => { const fullLoan = { ...newLoan, id: `l${Date.now()}` }; const updatedData = JSON.parse(JSON.stringify(data)); updatedData.liabilities.loans.push(fullLoan); setData(updatedData); setIsAddLoanDialogOpen(false); }
    const handleAddInstallment = (newInstallment: any) => { const fullInstallment = { ...newInstallment, id: `i${Date.now()}` }; const updatedData = JSON.parse(JSON.stringify(data)); updatedData.liabilities.installments.push(fullInstallment); setData(updatedData); setIsAddInstallmentDialogOpen(false); }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)] bg-gradient-to-r from-rose-950/20 to-transparent"><div><h1 className="text-3xl font-bold tracking-tight text-white">Liabilities & Debts</h1><p className="text-rose-400/80 mt-1 font-medium">Outstanding Loans & Payment Plans</p></div><div className="flex gap-2"><Button variant={isEditing ? "default" : "outline"} className={isEditing ? "bg-blue-600 hover:bg-blue-500" : "border-white/10 hover:bg-white/5"} onClick={isEditing ? handleSaveClick : handleEditClick}>{isEditing ? "Save Changes" : "Edit Mode"}</Button>{isEditing && <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={handleCancelClick}>Cancel</Button>}</div></div>

            {/* SUMMARY STATS */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="glass-panel p-5 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 to-black/20 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10 text-rose-500"><TrendingDown className="w-24 h-24" /></div>
                    <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-1 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Total Debt</p>
                    <p className="text-3xl font-bold font-mono text-white tracking-tight">{formatNumber(metrics?.totalLiabilities || 0)} <span className="text-sm font-normal text-muted-foreground">{currency}</span></p>
                </div>
                <div className="glass-panel p-5 rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 to-black/20 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10 text-pink-500"><Building className="w-24 h-24" /></div>
                    <p className="text-xs uppercase tracking-wider text-pink-300 font-semibold mb-1 flex items-center gap-2"><Building className="w-4 h-4" /> Project Installments</p>
                    <p className="text-3xl font-bold font-mono text-white tracking-tight">{formatNumber(metrics?.liabilities?.installments || 0)} <span className="text-sm font-normal text-muted-foreground">{currency}</span></p>
                </div>
                <div className="glass-panel p-5 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-black/20 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Landmark className="w-24 h-24" /></div>
                    <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1 flex items-center gap-2"><Landmark className="w-4 h-4" /> Bank Loans</p>
                    <p className="text-3xl font-bold font-mono text-white tracking-tight">{formatNumber(metrics?.liabilities?.loans || 0)} <span className="text-sm font-normal text-muted-foreground">{currency}</span></p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2"><h3 className="text-xl font-semibold flex items-center gap-2 text-white"><Building className="text-rose-500 h-5 w-5" /> Project Installments</h3><Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-500/10" onClick={() => setIsAddInstallmentDialogOpen(true)}>+ Add</Button></div>
                    {Object.entries(groupedInstallments).map(([projectGroup, projectInstallments]) => (
                        <div key={projectGroup} className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2 pl-1 uppercase tracking-wider"><FolderOpen className="h-4 w-4" /> {projectGroup}</h4>
                            {projectInstallments.map(p => {
                                const parentAsset = data.assets.underDevelopment.find((a: any) => a.linkedInstallmentId === p.id);
                                const calculatedTotal = parentAsset ? (Number(parentAsset.purchasePrice) || 0) + (Number(parentAsset.maintenanceCost) || 0) + (Number(parentAsset.parkingCost) || 0) : p.total;
                                const progress = calculatedTotal > 0 ? (p.paid / calculatedTotal) * 100 : 0;
                                const remaining = calculatedTotal - p.paid;
                                const dateParts = p.nextDueDate.split('-').map(part => parseInt(part, 10));
                                const nextDueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                                const formattedDueDate = isValid(nextDueDate) ? format(nextDueDate, 'MMM d, yyyy') : 'Invalid Date';

                                return (
                                    <div key={p.id} className="glass-panel p-5 rounded-xl relative group border border-pink-500/30 bg-gradient-to-br from-pink-950/20 to-black/40 shadow-lg hover:border-pink-500/50 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4"><div><h4 className="font-bold text-lg text-white group-hover:text-pink-100 transition-colors">{p.project}</h4><p className="text-xs text-pink-300/80">{p.developer}</p></div><div className="text-right"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Paid</div><div className="font-mono font-bold text-pink-400 text-lg">{progress.toFixed(1)}%</div></div></div>
                                        <Progress value={progress} className="h-2 bg-pink-950 border border-pink-500/20 mb-6" />
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Total Cost</label><p className="font-mono text-white opacity-80">{formatNumber(calculatedTotal)} {p.currency}</p></div>
                                            <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Outstanding</label><p className="font-mono font-bold text-rose-400">{formatNumber(remaining)}</p></div>
                                            <div className="col-span-2 pt-2"><div className="flex justify-between items-center bg-white/5 p-2 rounded"><div><span className="text-[10px] text-muted-foreground block">TOTAL PAID</span><span className="font-bold text-emerald-400">{formatNumber(p.paid)}</span></div><Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs" onClick={() => setActiveHistory(p)}><ScrollText className="h-3 w-3 mr-1" /> Manage Payments</Button></div></div>
                                            <div className="space-y-1 mt-1 col-span-2"><div className="flex justify-between items-center bg-pink-950/30 p-2 rounded border border-pink-500/10"><span className="text-xs text-pink-200">Next Installment</span><div className="flex items-center gap-2"><span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">{formattedDueDate}</span>{isEditing ? <GlassInput type="number" className="w-24 text-right" defaultValue={p.amount} onChange={(e: any) => handleInstallmentChange(p.id, 'amount', e.target.value)} /> : <span className="font-mono font-bold text-pink-400">{formatNumber(p.amount)}</span>}</div></div></div>
                                            {(p.notes || isEditing) && (<div className="col-span-2 bg-pink-500/10 p-2 rounded border border-pink-500/20 mt-2"><label className="text-[10px] text-pink-400 flex items-center gap-1"><StickyNote className="h-3 w-3" /> Notes</label>{isEditing ? <textarea className="w-full bg-transparent text-xs text-white border-0 focus:ring-0 p-0" rows={2} value={p.notes || ""} onChange={(e) => handleInstallmentChange(p.id, 'notes', e.target.value)} placeholder="Add private notes..." /> : <p className="text-xs text-slate-300 italic">{p.notes}</p>}</div>)}
                                        </div>
                                        {isEditing && <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'installment', id: p.id })}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>)
                            })}
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2"><h3 className="text-xl font-semibold flex items-center gap-2 text-white"><Landmark className="text-amber-500 h-5 w-5" /> Bank Loans</h3><Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-500/10" onClick={() => setIsAddLoanDialogOpen(true)}>+ Add</Button></div>
                    <div className="space-y-4">
                        {loans.map(l => (
                            <div key={l.id} className="glass-panel p-5 rounded-xl relative border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-black/40 shadow-lg hover:border-amber-500/50 transition-all duration-300 group">
                                <div className="flex justify-between items-center mb-4"><p className="font-bold text-lg text-white group-hover:text-amber-100 transition-colors">{l.lender}</p><span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">Active Loan</span></div>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                    <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Original Loan</label>{isEditing ? <GlassInput type="number" defaultValue={l.initial} onChange={(e: any) => handleLoanChange(l.id, 'initial', e.target.value)} /> : <p className="font-mono text-slate-300">{formatNumber(l.initial)} {l.currency}</p>}</div>
                                    <div className="space-y-1"><label className="text-[10px] uppercase text-muted-foreground">Remaining Debt</label>{isEditing ? <GlassInput type="number" defaultValue={l.remaining} onChange={(e: any) => handleLoanChange(l.id, 'remaining', e.target.value)} /> : <p className="font-mono font-bold text-rose-400 text-lg">{formatNumber(l.remaining)}</p>}</div>

                                    {/* FIX: ADDED MONTHLY PAYMENT DISPLAY */}
                                    <div className="col-span-2 pt-2 border-t border-amber-500/10 flex justify-between items-center bg-amber-950/20 p-2 rounded">
                                        <span className="text-xs text-amber-200">Monthly Payment</span>
                                        {isEditing ? <GlassInput className="w-32 text-right" type="number" defaultValue={l.monthlyPayment} onChange={(e: any) => handleLoanChange(l.id, 'monthlyPayment', e.target.value)} /> : <p className="font-mono font-bold text-amber-400">-{l.monthlyPayment.toLocaleString()} <span className="text-xs font-normal text-amber-500/80">{l.currency}</span></p>}
                                    </div>

                                    {(l.notes || isEditing) && <div className="col-span-2 bg-amber-500/10 p-2 rounded border border-amber-500/20"><label className="text-[10px] text-amber-400 flex items-center gap-1"><StickyNote className="h-3 w-3" /> Notes</label>{isEditing ? <textarea className="w-full bg-transparent text-xs text-white border-0 focus:ring-0 p-0" rows={2} value={l.notes || ""} onChange={(e) => handleLoanChange(l.id, 'notes', e.target.value)} /> : <p className="text-xs text-slate-300 italic">{l.notes}</p>}</div>}
                                </div>
                                {isEditing && <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: 'loan', id: l.id })}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={!!activeHistory} onOpenChange={() => setActiveHistory(null)}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-[500px]"><DialogHeader><DialogTitle>Plan: {activeHistory?.project}</DialogTitle></DialogHeader>
                    <Tabs defaultValue="schedule" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-black/40"><TabsTrigger value="schedule">Future Schedule</TabsTrigger><TabsTrigger value="history">Paid History</TabsTrigger></TabsList>

                        <TabsContent value="schedule" className="space-y-4">
                            <div className="bg-black/40 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto space-y-2">
                                {activeHistory?.schedule && activeHistory.schedule.length > 0 ? (activeHistory.schedule.map((rec: PaymentRecord) => {
                                    const isPast = new Date(rec.date) < new Date();
                                    return (
                                        <div key={rec.id} className={`flex justify-between items-center p-2 rounded border ${isPast ? 'bg-red-900/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <Checkbox id={`check-${rec.id}`} className="border-white/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" onCheckedChange={(checked) => { if (checked) handleMarkScheduleAsPaid(rec.id); }} />
                                                <div><p className={`text-sm font-bold ${isPast ? 'text-red-400' : 'text-white'}`}>{formatNumber(rec.amount)}</p><p className="text-[10px] text-muted-foreground">{rec.date} • {rec.description}</p></div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteSchedule(rec.id)}><X className="h-3 w-3" /></Button>
                                        </div>
                                    )
                                })) : <p className="text-center text-sm text-muted-foreground">No future schedule.</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10"><Input type="date" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.date} onChange={e => setNewScheduleItem({ ...newScheduleItem, date: e.target.value })} /><Input placeholder="Amount" type="number" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.amount} onChange={e => setNewScheduleItem({ ...newScheduleItem, amount: e.target.value })} /><Input placeholder="Desc" className="bg-black/20 text-white border-white/10 text-xs" value={newScheduleItem.desc} onChange={e => setNewScheduleItem({ ...newScheduleItem, desc: e.target.value })} /></div><Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddSchedule}><Plus className="h-4 w-4 mr-2" /> Add to Schedule</Button>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                            <div className="bg-black/40 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto space-y-2">{activeHistory?.paymentHistory && activeHistory.paymentHistory.length > 0 ? (activeHistory.paymentHistory.map((rec: PaymentRecord) => (<div key={rec.id} className="flex justify-between items-center p-2 bg-emerald-900/10 border border-emerald-500/20 rounded"><div><p className="text-sm font-bold text-emerald-400">{formatNumber(rec.amount)}</p><p className="text-[10px] text-muted-foreground">{rec.date} • {rec.description}</p></div><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleDeletePayment(rec.id)}><X className="h-3 w-3" /></Button></div>))) : <p className="text-center text-sm text-muted-foreground">No payments recorded yet.</p>}</div><div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10"><Input type="date" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} /><Input placeholder="Amount" type="number" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} /><Input placeholder="Desc" className="bg-black/20 text-white border-white/10 text-xs" value={newPayment.desc} onChange={e => setNewPayment({ ...newPayment, desc: e.target.value })} /></div><Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddPayment}><Plus className="h-4 w-4 mr-2" /> Add Paid Record</Button>
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