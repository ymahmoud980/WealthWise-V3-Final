"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, Installment } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package, Building2, Coins, Paperclip, Calendar, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const GlassInput = (props: any) => (
  <Input 
    {...props} 
    className={cn("bg-black/20 border-white/10 text-foreground focus:ring-primary/50 h-7 text-xs px-2", props.className)} 
  />
);

export default function AssetsPage() {
  const { data, setData, loading } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  useEffect(() => {
    if (isEditing) setEditableData(JSON.parse(JSON.stringify(data)));
  }, [isEditing, data]);

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => { setData(editableData); setIsEditing(false); };
  const handleCancelClick = () => setIsEditing(false);

  const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const timestamp = new Date().getTime();

    if (type === 'underDevelopment') {
        const assetId = `ud${timestamp}`;
        const installmentId = `inst${timestamp}`;
        
        // Calculate Total
        const basePrice = Number(newAsset.purchasePrice) || 0;
        const maint = Number(newAsset.maintenanceCost) || 0;
        const park = Number(newAsset.parkingCost) || 0;
        const totalContractPrice = basePrice + maint + park;

        // Add Asset
        updatedData.assets.underDevelopment.push({ ...newAsset, id: assetId, linkedInstallmentId: installmentId });

        // Add Liability
        updatedData.liabilities.installments.push({
            id: installmentId,
            project: newAsset.name,
            developer: newAsset.location,
            total: totalContractPrice,
            paid: 0,
            amount: 0,
            nextDueDate: newAsset.maintenanceDueDate || new Date().toISOString().split('T')[0],
            currency: newAsset.currency,
            frequency: newAsset.paymentFrequency || 'Quarterly'
        });

    } else if (['gold', 'silver', 'cash'].includes(type)) {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existing = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);
        if (existing) {
            if (type === 'cash') {
                 if (existing.currency === newAsset.currency) existing.amount += Number(newAsset.amount);
                 else updatedData.assets[assetKey].push({ ...newAsset, id: `${type.substring(0, 2)}${timestamp}` });
            } else {
                existing.grams += Number(newAsset.grams);
            }
        } else {
            updatedData.assets[assetKey].push({ ...newAsset, id: `${type.substring(0, 2)}${timestamp}` });
        }
    } else {
        const key = type === 'realEstate' ? 'realEstate' : 'otherAssets';
        updatedData.assets[key].push({ ...newAsset, id: `${type.substring(0, 2)}${timestamp}` });
    }

    setData(updatedData);
    setIsAddAssetDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const updatedData = JSON.parse(JSON.stringify(data));
    const key = type === 'other' ? 'otherAssets' : type as keyof FinancialData['assets'];
    
    if (updatedData.assets[key]) {
        updatedData.assets[key] = updatedData.assets[key].filter((item: any) => item.id !== id);
    }
    // Remove linked liability
    if (type === 'underDevelopment') {
       const asset = data.assets.underDevelopment.find(a => a.id === id);
       if (asset?.linkedInstallmentId) {
           updatedData.liabilities.installments = updatedData.liabilities.installments.filter((i: any) => i.id !== asset.linkedInstallmentId);
       }
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
          if (idx > -1) {
              list[idx][field] = field === 'name' || field === 'location' || field === 'currency' || field === 'rentFrequency' ? val : (parseFloat(val) || 0);
          }
          return { ...prev };
      });
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Holdings</h1>
          <p className="text-muted-foreground mt-1">Portfolio Breakdown</p>
        </div>
        <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>
              + Add Asset
            </Button>
            <Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSaveClick : handleEditClick}>
                {isEditing ? "Save Changes" : "Edit Mode"}
            </Button>
            {isEditing && <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>}
        </div>
      </div>

      {/* --- READY PROPERTIES --- */}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white"><Paperclip className="h-4 w-4" /></Button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)} />
                                    <GlassInput className="w-16" value={p.currency} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currency', e.target.value)} />
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-emerald-500">{formatNumber(p.currentValue)} {p.currency}</p>
                            )}
                        </div>
                        
                        {/* RENT DETAILS RESTORED */}
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> Monthly Rent</span>
                                {isEditing ? <GlassInput type="number" className="w-24 text-right" value={p.monthlyRent} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'monthlyRent', e.target.value)}/> : <span className="font-mono text-emerald-400">+{formatNumber(p.monthlyRent)}</span>}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Frequency</span>
                                {isEditing ? (
                                    <select className="bg-black/20 border border-white/10 rounded h-6 text-xs" value={p.rentFrequency} onChange={(e) => handleAssetChange('realEstate', p.id, 'rentFrequency', e.target.value)}>
                                        <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option>
                                    </select>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] h-5">{p.rentFrequency}</Badge>
                                )}
                            </div>
                        </div>

                        {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove Asset</Button>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- OFF PLAN (CONTRACT PRICE EDITING FIXED) --- */}
      <div className="space-y-6 pt-6 border-t border-dashed border-white/10">
        <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2"><Package className="h-6 w-6" /> Off-Plan Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(underDevelopment || []).map(p => {
                const linkedInstallment = installments.find(i => i.id === p.linkedInstallmentId);
                const progress = linkedInstallment && linkedInstallment.total > 0 ? (linkedInstallment.paid / linkedInstallment.total) * 100 : 0;
                
                // Calculate Total from the 3 components
                const base = p.purchasePrice || 0;
                const maint = p.maintenanceCost || 0;
                const park = p.parkingCost || 0;
                const total = base + maint + park;

                return (
                    <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-dashed border-purple-500/30 group">
                        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-4 border-b border-white/5 flex justify-between items-start">
                            <div className="flex-1">
                                {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg">{p.name}</h4>}
                                <p className="text-xs text-purple-300">Off-Plan • {p.location}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300/50 hover:text-white"><Paperclip className="h-4 w-4" /></Button>
                        </div>
                        
                        <div className="p-5 space-y-4 bg-black/20">
                            {/* PROGRESS BAR */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground"><span>Paid: {progress.toFixed(1)}%</span><span>Total: {formatNumber(total)}</span></div>
                                <Progress value={progress} className="h-1.5 bg-white/10" />
                            </div>

                            {/* COST BREAKDOWN (ALL EDITABLE NOW) */}
                            <div className="bg-white/5 p-3 rounded-lg text-xs space-y-2 border border-white/5">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Contract Price:</span> 
                                    {/* FIX: THIS IS NOW EDITABLE */}
                                    {isEditing ? <GlassInput className="w-24 text-right" type="number" value={base} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'purchasePrice', e.target.value)} /> : <span>{formatNumber(base)}</span>}
                                </div>
                                <div className="flex justify-between items-center text-purple-300">
                                    <span>Maintenance:</span>
                                    {isEditing ? <GlassInput className="w-24 text-right" type="number" value={maint} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'maintenanceCost', e.target.value)} /> : <span>{formatNumber(maint)}</span>}
                                </div>
                                <div className="flex justify-between items-center text-purple-300">
                                    <span>Parking:</span>
                                    {isEditing ? <GlassInput className="w-24 text-right" type="number" value={park} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'parkingCost', e.target.value)} /> : <span>{formatNumber(park)}</span>}
                                </div>
                                <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-1 text-white">
                                    <span>Total Value:</span> 
                                    <span>{formatNumber(total)} {p.currency}</span>
                                </div>
                            </div>

                            {/* CURRENT MARKET VALUE */}
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Market Value</p>
                                {isEditing ? <GlassInput value={p.currentValue} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)} /> : <p className="text-xl font-bold text-purple-400">{formatNumber(p.currentValue)}</p>}
                            </div>

                            {isEditing && <Button variant="destructive" size="sm" className="w-full" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-white/10">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-emerald-400"><Wallet className="h-5 w-5" /> Cash</div>
             <div className="glass-panel p-1 rounded-xl space-y-1 border border-emerald-500/20">
                 {(cash || []).map(item => (
                     <div key={item.id} className="p-4 flex justify-between items-center hover:bg-white/5">
                        <span className="font-medium">{item.location}</span>
                        <span className="font-mono font-bold text-emerald-400">{formatNumber(item.amount)} {item.currency}</span>
                        {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget({ type: 'cash', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                     </div>
                 ))}
             </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold text-amber-400"><Gem className="h-5 w-5" /> Metals</div>
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="glass-panel p-4 rounded-xl border border-amber-500/20">
                    <h4 className="text-amber-500 font-bold mb-2">Gold</h4>
                    {(gold || []).map(item => (
                        <div key={item.id} className="flex justify-between p-2 border-b border-white/5">
                            <span>{item.location}</span>
                            {isEditing ? <GlassInput type="number" className="w-20" value={item.grams} onChange={(e: any) => handleAssetChange('gold', item.id, 'grams', e.target.value)} /> : <span className="font-mono font-bold">{item.grams}g</span>}
                            {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget({ type: 'gold', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                        </div>
                    ))}
                 </div>
                 <div className="glass-panel p-4 rounded-xl border border-slate-500/20">
                    <h4 className="text-slate-300 font-bold mb-2">Silver</h4>
                    {(silver || []).map(item => (
                        <div key={item.id} className="flex justify-between p-2 border-b border-white/5">
                            <span>{item.location}</span>
                            {isEditing ? <GlassInput type="number" className="w-20" value={item.grams} onChange={(e: any) => handleAssetChange('silver', item.id, 'grams', e.target.value)} /> : <span className="font-mono font-bold">{item.grams}g</span>}
                            {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget({ type: 'silver', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                        </div>
                    ))}
                 </div>
             </div>
          </div>
      </div>

      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={() => setIsAddAssetDialogOpen(false)} onAddAsset={handleAddAsset} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}