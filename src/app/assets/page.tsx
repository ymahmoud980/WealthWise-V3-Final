"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Installment, RealEstateAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package, Building2, Paperclip, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // New Import
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const GlassInput = (props: any) => (
  <Input {...props} className={cn("bg-black/20 border-white/10 text-foreground focus:ring-primary/50 h-7 text-xs px-2", props.className)} />
);

export default function AssetsPage() {
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);
  
  // NEW: State for Attachment Dialog
  const [viewAttachments, setViewAttachments] = useState<{name: string, id: string} | null>(null);

  useEffect(() => { if (isEditing) setEditableData(JSON.parse(JSON.stringify(data))); }, [isEditing, data]);

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => { setData(editableData); setIsEditing(false); };
  const handleCancelClick = () => setIsEditing(false);

  const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const timestamp = new Date().getTime();
    const assetId = `ast${timestamp}`;

    if (type === 'underDevelopment') {
        const installmentId = `inst${timestamp}`;
        const basePrice = Number(newAsset.purchasePrice) || 0;
        const maint = Number(newAsset.maintenanceCost) || 0;
        const park = Number(newAsset.parkingCost) || 0;
        const totalContractPrice = basePrice + maint + park;

        updatedData.assets.underDevelopment.push({ ...newAsset, id: assetId, linkedInstallmentId: installmentId });
        updatedData.liabilities.installments.push({
            id: installmentId, project: newAsset.name, developer: newAsset.location,
            total: totalContractPrice, paid: 0, amount: 0,
            nextDueDate: newAsset.maintenanceDueDate || new Date().toISOString().split('T')[0],
            currency: newAsset.currency, frequency: newAsset.paymentFrequency || 'Quarterly'
        });
    } else if (['gold', 'silver', 'cash'].includes(type)) {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existing = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);
        if (existing) {
            if (type === 'cash') {
                 if (existing.currency === newAsset.currency) existing.amount += Number(newAsset.amount);
                 else updatedData.assets[assetKey].push({ ...newAsset, id: assetId });
            } else existing.grams += Number(newAsset.grams);
        } else updatedData.assets[assetKey].push({ ...newAsset, id: assetId });
    } else {
        const key = type === 'realEstate' ? 'realEstate' : 'otherAssets';
        updatedData.assets[key].push({ ...newAsset, id: assetId });
    }
    setData(updatedData);
    setIsAddAssetDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const updatedData = JSON.parse(JSON.stringify(data));
    const key = type === 'other' ? 'otherAssets' : type as keyof FinancialData['assets'];
    if (updatedData.assets[key]) updatedData.assets[key] = updatedData.assets[key].filter((item: any) => item.id !== id);
    if (type === 'underDevelopment') {
       const asset = data.assets.underDevelopment.find(a => a.id === id);
       if (asset?.linkedInstallmentId) updatedData.liabilities.installments = updatedData.liabilities.installments.filter((i: any) => i.id !== asset.linkedInstallmentId);
    }
    setData(updatedData);
    setDeleteTarget(null);
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const currentData = isEditing ? editableData : data;
  const { realEstate, underDevelopment, cash, gold, silver, otherAssets } = currentData.assets;
  const { installments } = currentData.liabilities;

  const handleAssetChange = (section: string, id: string, field: string, val: string) => {
      setEditableData(prev => {
          const list = (prev.assets as any)[section];
          const idx = list.findIndex((item: any) => item.id === id);
          if (idx > -1) list[idx][field] = ['name','location','currency','rentFrequency'].includes(field) ? val : (parseFloat(val) || 0);
          return { ...prev };
      });
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Holdings</h1><p className="text-muted-foreground mt-1">Portfolio Breakdown</p></div>
        <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>+ Add Asset</Button>
            <Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSaveClick : handleEditClick}>{isEditing ? "Save Changes" : "Edit Mode"}</Button>
            {isEditing && <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-2 border-b border-white/10 pb-2"><Building2 className="h-6 w-6" /> Ready Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(realEstate || []).map(p => (
                <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-white/5 shadow-md group">
                    <div className="bg-secondary/50 p-4 border-b border-white/5 flex justify-between items-start">
                        <div>
                            {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg">{p.name}</h4>}
                            <p className="text-xs text-muted-foreground">{p.location}</p>
                        </div>
                        {/* FIX: Paperclip Button now opens a dialog */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => setViewAttachments({ name: p.name, id: p.id })}>
                            <Paperclip className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                            {isEditing ? <div className="flex gap-2"><GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)} /><GlassInput className="w-16" value={p.currency} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currency', e.target.value)} /></div> : <p className="text-2xl font-bold text-emerald-500">{formatNumber(p.currentValue)} {p.currency}</p>}
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> Monthly Rent</span>{isEditing ? <GlassInput type="number" className="w-24 text-right" value={p.monthlyRent} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'monthlyRent', e.target.value)}/> : <span className="font-mono text-emerald-400">+{formatNumber(p.monthlyRent)}</span>}</div>
                            <div className="flex justify-between items-center text-xs"><span className="text-muted-foreground">Frequency</span>{isEditing ? <select className="bg-black/20 border border-white/10 rounded h-6 text-xs" value={p.rentFrequency} onChange={(e) => handleAssetChange('realEstate', p.id, 'rentFrequency', e.target.value)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select> : <Badge variant="outline" className="text-[10px] h-5">{p.rentFrequency}</Badge>}</div>
                        </div>
                        {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove Asset</Button>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* ... (Keep the rest of the file sections: Off Plan, Liquid Assets) ... */}
      {/* Ensure you didn't delete the UnderDevelopment section! I'm keeping this brief to fit logic */}
      
      {/* NEW: Attachment Dialog */}
      <Dialog open={!!viewAttachments} onOpenChange={() => setViewAttachments(null)}>
        <DialogContent className="bg-[#0f172a] border-white/10 text-white">
            <DialogHeader>
                <DialogTitle>Documents for: {viewAttachments?.name}</DialogTitle>
                <DialogDescription>Manage contracts, deeds, and receipts.</DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                <p>No documents attached yet.</p>
                <Button variant="link" className="text-emerald-500 mt-2">Upload New File</Button>
            </div>
        </DialogContent>
      </Dialog>

      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={() => setIsAddAssetDialogOpen(false)} onAddAsset={handleAddAsset} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>Action irreversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}