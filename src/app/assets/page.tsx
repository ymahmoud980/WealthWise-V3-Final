"use client"

import { DocumentManager } from "@/components/assets/DocumentManager";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, RealEstateAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package, Building2, Coins, MapPin } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const GlassInput = (props: any) => (
  <Input 
    {...props} 
    className={cn("bg-black/20 border-white/10 text-foreground focus:ring-primary/50 h-8 transition-all", props.className)} 
  />
);

export default function AssetsPage() {
  const { data, setData, loading } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  useEffect(() => {
    if (isEditing) {
        setEditableData(JSON.parse(JSON.stringify(data)));
    }
  }, [isEditing, data]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const handleDocumentUpdate = (assetId: string, newDocs: any[], type: 'realEstate' | 'underDevelopment') => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const list = updatedData.assets[type] as any[];
    const assetIndex = list.findIndex((a: any) => a.id === assetId);
    if (assetIndex !== -1) {
        list[assetIndex].documents = newDocs;
        setData(updatedData);
        setEditableData(updatedData);
    }
  };

  const handleAssetChange = <T extends { id: string }>(
    assetTypeKey: keyof FinancialData['assets'],
    id: string,
    field: keyof T,
    value: any 
  ) => {
    setEditableData(prevData => {
        const assetList = prevData.assets[assetTypeKey] as T[];
        const updatedAssetList = assetList.map(asset => {
            if (asset.id === id) {
                const updatedAsset = { ...asset };
                (updatedAsset[field] as any) = value;
                return updatedAsset;
            }
            return asset;
        });
        return { ...prevData, assets: { ...prevData.assets, [assetTypeKey]: updatedAssetList } };
    });
  };

  const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    if (type === 'gold' || type === 'silver' || type === 'cash') {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existingAsset = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);
        if (existingAsset) {
            if (type === 'gold' || type === 'silver') existingAsset.grams = Number(existingAsset.grams) + Number(newAsset.grams);
            else { 
                 if (existingAsset.currency === newAsset.currency) existingAsset.amount = Number(existingAsset.amount) + Number(newAsset.amount);
                 else (updatedData.assets[assetKey] as any[]).push({ ...newAsset, id: `${type.substring(0, 2)}${new Date().getTime()}` });
            }
        } else {
            (updatedData.assets[assetKey] as any[]).push({ ...newAsset, id: `${type.substring(0, 2)}${new Date().getTime()}` });
        }
    } else {
        const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
        const assetKeyMap: { [key: string]: keyof FinancialData['assets'] } = {
            realEstate: 'realEstate', underDevelopment: 'underDevelopment', other: 'otherAssets'
        };
        const assetKey = assetKeyMap[type];
        if (assetKey) {
            if (!updatedData.assets[assetKey]) (updatedData.assets as any)[assetKey] = [];
            (updatedData.assets[assetKey] as any[]).push({ ...newAsset, id: newId });
        }
    }
    setData(updatedData);
    setIsAddAssetDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const updatedData = JSON.parse(JSON.stringify(data));
    const assetKeyMap: { [key: string]: keyof FinancialData['assets'] } = {
        realEstate: 'realEstate', underDevelopment: 'underDevelopment', cash: 'cash', gold: 'gold', silver: 'silver', other: 'otherAssets'
    };
    const assetKey = assetKeyMap[type];
    if (assetKey) {
        const assetList = updatedData.assets[assetKey] as any[];
        updatedData.assets[assetKey] = assetList.filter(item => item.id !== id);
    }
    setData(updatedData);
    setDeleteTarget(null);
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const currentData = isEditing ? editableData : data;
  const { realEstate, underDevelopment, cash, gold, silver, otherAssets } = currentData.assets;
  const { installments } = currentData.liabilities;

  // Grouping
  const groupedAssets: Record<string, RealEstateAsset[]> = {};
  (realEstate || []).forEach(asset => {
    const location = asset.location || "Uncategorized";
    if (!groupedAssets[location]) groupedAssets[location] = [];
    groupedAssets[location].push(asset);
  });
  const groupedDevelopment: Record<string, any[]> = {};
  (underDevelopment || []).forEach(asset => {
    const location = asset.location || "Uncategorized";
    if (!groupedDevelopment[location]) groupedDevelopment[location] = [];
    groupedDevelopment[location].push(asset);
  });
  
  return (
    <div className="space-y-12 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Holdings</h1>
          <p className="text-muted-foreground mt-1">Portfolio Breakdown</p>
        </div>
        <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>+ Add Asset</Button>
            {isEditing ? (
              <>
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveClick}>Save</Button>
                <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEditClick}>Edit Mode</Button>
            )}
        </div>
      </div>

      {/* --- REAL ESTATE SECTION --- */}
      {Object.keys(groupedAssets).length > 0 && (
        <div className="space-y-10">
            <h2 className="text-2xl font-bold text-emerald-500 flex items-center gap-3 border-b border-white/10 pb-4">
                <Building2 className="h-7 w-7" /> Real Estate
            </h2>
            
            {Object.entries(groupedAssets).map(([location, assets]) => (
                <div key={location} className="space-y-5 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-400" /> {location}
                        <span className="text-xs font-normal text-muted-foreground ml-2 bg-black/20 px-2 py-1 rounded-full">{assets.length} Units</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {assets.map(p => (
                            <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-lg">
                                {/* Card Header */}
                                <div className="bg-secondary/50 p-4 border-b border-white/5 flex justify-between items-start">
                                    <div>
                                        {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg text-foreground">{p.name}</h4>}
                                        <p className="text-xs text-muted-foreground">{p.location}</p>
                                    </div>
                                    <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Building2 className="h-4 w-4 text-emerald-500" /></div>
                                </div>
                                {/* Card Body */}
                                <div className="p-5 space-y-4 bg-card/40">
                                    {/* Market Value */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                                        {isEditing ? <div className="flex gap-2 items-center"><GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)}/><span className="text-xs font-mono">{p.currency}</span></div> : <p className="font-mono text-2xl font-bold text-emerald-500">{formatNumber(p.currentValue)} <span className="text-sm text-muted-foreground">{p.currency}</span></p>}
                                    </div>

                                    {/* --- RESTORED: MONTHLY RENT --- */}
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                       <div className="text-xs text-muted-foreground">Monthly Rent</div>
                                       {isEditing ? (
                                         <GlassInput 
                                            type="number" 
                                            value={p.monthlyRent}
                                            className="w-24 text-right"
                                            onChange={(e: any) => handleAssetChange('realEstate', p.id, 'monthlyRent', e.target.value)}
                                         />
                                       ) : (
                                         <div className="font-mono font-medium text-emerald-400">+{formatNumber(p.monthlyRent)} {p.rentCurrency || p.currency}</div>
                                       )}
                                    </div>

                                    {/* Documents */}
                                    <div className="pt-4 border-t border-white/5">
                                        <DocumentManager assetId={p.id} documents={p.documents || []} onUpdate={(newDocs) => handleDocumentUpdate(p.id, newDocs, 'realEstate')} />
                                    </div>
                                    {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- UNDER DEVELOPMENT SECTION --- */}
      {Object.keys(groupedDevelopment).length > 0 && (
        <div className="space-y-10 pt-10 border-t border-white/10">
            <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-3">
                <Package className="h-7 w-7" /> Under Development
            </h2>
            
            {Object.entries(groupedDevelopment).map(([location, assets]) => (
                <div key={location} className="space-y-5 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-purple-400" /> {location} Projects
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {assets.map(p => {
                            const linkedInstallment = installments.find(i => i.id === p.linkedInstallmentId);
                            const progress = linkedInstallment && !loading ? (linkedInstallment.paid / linkedInstallment.total) * 100 : 0;
                            return (
                                <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-dashed border-purple-500/30">
                                    <div className="bg-secondary/50 p-4 border-b border-white/5 flex justify-between items-start">
                                        <div>
                                            {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg text-foreground">{p.name}</h4>}
                                            <p className="text-xs text-purple-400">Off-Plan</p>
                                        </div>
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg"><Package className="h-4 w-4 text-purple-400" /></div>
                                    </div>
                                    <div className="p-5 space-y-4 bg-card/40">
                                        <div className="space-y-2"><div className="flex justify-between text-xs"><span>Progress</span><span className="text-purple-300 font-mono">{progress.toFixed(1)}%</span></div><Progress value={progress} className="h-1.5 bg-white/10" /></div>
                                        <div className="space-y-1"><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Value</label>{isEditing ? <GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)}/> : <p className="font-mono text-sm font-bold text-purple-400">{formatNumber(p.currentValue)}</p>}</div>
                                        <div className="pt-4 border-t border-white/5"><DocumentManager assetId={p.id} documents={p.documents || []} onUpdate={(newDocs) => handleDocumentUpdate(p.id, newDocs, 'underDevelopment')} /></div>
                                        {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- LIQUID ASSETS SEPARATOR --- */}
      <div className="border-t-2 border-dashed border-white/10 my-12" />

      {/* Liquid Assets Section */}
      <div className="space-y-8">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3">
             <Wallet className="h-7 w-7" /> Liquid & Other Assets
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cash Card */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-4 border-emerald-500">
                 <h3 className="text-lg font-semibold flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-500"/> Cash Reserves</h3>
                 <div className="space-y-2">
                     {(cash || []).map(item => (
                         <div key={item.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg hover:bg-white/5 transition-colors group">
                            <span className="font-medium text-sm">{item.location}</span>
                            <div className="text-right">
                                {isEditing ? <GlassInput type="number" value={item.amount} className="w-24 text-right" onChange={(e: any) => handleAssetChange('cash', item.id, 'amount', e.target.value)}/> : <span className="font-mono font-bold text-emerald-400">{formatNumber(item.amount)} <span className="text-xs text-muted-foreground">{item.currency}</span></span>}
                            </div>
                            {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setDeleteTarget({ type: 'cash', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                         </div>
                     ))}
                 </div>
              </div>

              {/* Metals Card */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-4 border-amber-500">
                 <h3 className="text-lg font-semibold flex items-center gap-2"><Gem className="h-5 w-5 text-amber-500"/> Precious Metals</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="text-xs uppercase text-amber-500/70 font-bold">Gold</div>
                        {(gold || []).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-amber-900/10 rounded border border-amber-500/20">
                                <span className="text-sm">{item.location}</span>
                                {isEditing ? <GlassInput type="number" value={item.grams} className="w-20 text-right" onChange={(e: any) => handleAssetChange('gold', item.id, 'grams', e.target.value)}/> : <span className="font-mono font-bold">{formatNumber(item.grams)}g</span>}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs uppercase text-slate-400 font-bold">Silver</div>
                        {(silver || []).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-slate-800/30 rounded border border-slate-500/20">
                                <span className="text-sm">{item.location}</span>
                                {isEditing ? <GlassInput type="number" value={item.grams} className="w-20 text-right" onChange={(e: any) => handleAssetChange('silver', item.id, 'grams', e.target.value)}/> : <span className="font-mono font-bold">{formatNumber(item.grams)}g</span>}
                            </div>
                        ))}
                    </div>
                 </div>
              </div>

              {/* Other Assets Card */}
              <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-4 border-indigo-500">
                 <h3 className="text-lg font-semibold flex items-center gap-2"><Scale className="h-5 w-5 text-indigo-500"/> Loans & Others</h3>
                 <div className="space-y-2">
                    {(otherAssets || []).map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg hover:bg-white/5 transition-colors group">
                            <span className="font-medium text-sm truncate pr-2">{item.description}</span>
                            <div className="text-right whitespace-nowrap">
                                {isEditing ? <GlassInput type="number" value={item.value} className="w-24 text-right" onChange={(e: any) => handleAssetChange('otherAssets', item.id, 'value', e.target.value)}/> : <span className="font-mono font-bold text-indigo-300">{formatNumber(item.value)} <span className="text-xs text-muted-foreground">{item.currency}</span></span>}
                            </div>
                            {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setDeleteTarget({ type: 'otherAssets', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                        </div>
                    ))}
                 </div>
              </div>

          </div>
      </div>

      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={() => setIsAddAssetDialogOpen(false)} onAddAsset={handleAddAsset} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>This will remove the asset from your portfolio permanently.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">Delete Asset</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}