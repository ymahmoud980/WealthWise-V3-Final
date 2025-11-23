"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package, Building2, Coins, ArrowUpRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Helper for inputs to look good on dark backgrounds
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
  
  const handleCancelClick = () => setIsEditing(false);

  const handleAssetChange = <T extends { id: string }>(
    assetTypeKey: keyof FinancialData['assets'],
    id: string,
    field: keyof T,
    value: string | number
  ) => {
    setEditableData(prevData => {
        const assetList = prevData.assets[assetTypeKey] as T[];
        const updatedAssetList = assetList.map(asset => {
            if (asset.id === id) {
                const updatedAsset = { ...asset };
                (updatedAsset[field] as any) = typeof asset[field] === 'number'
                    ? parseFloat(value as string) || 0
                    : value;
                return updatedAsset;
            }
            return asset;
        });
        return { ...prevData, assets: { ...prevData.assets, [assetTypeKey]: updatedAssetList } };
    });
  };

 const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    // (Logic kept exactly as your original code)
    if (type === 'gold' || type === 'silver' || type === 'cash') {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existingAsset = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);

        if (existingAsset) {
            if (type === 'gold' || type === 'silver') {
                existingAsset.grams = Number(existingAsset.grams) + Number(newAsset.grams);
            } else { 
                 if (existingAsset.currency === newAsset.currency) {
                    existingAsset.amount = Number(existingAsset.amount) + Number(newAsset.amount);
                 } else {
                    const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
                    (updatedData.assets[assetKey] as any[]).push({ ...newAsset, id: newId });
                 }
            }
        } else {
            const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
            (updatedData.assets[assetKey] as any[]).push({ ...newAsset, id: newId });
        }
    } else {
        const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
        const assetKeyMap: { [key: string]: keyof FinancialData['assets'] } = {
            realEstate: 'realEstate',
            underDevelopment: 'underDevelopment',
            other: 'otherAssets',
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
        realEstate: 'realEstate',
        underDevelopment: 'underDevelopment',
        cash: 'cash',
        gold: 'gold',
        silver: 'silver',
        other: 'otherAssets',
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
  
  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets & Holdings</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio across Real Estate, Metals, and Cash.</p>
        </div>
        <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>
              + Add Asset
            </Button>
            {isEditing ? (
              <>
                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleSaveClick}>Save</Button>
                <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEditClick} className="border-white/10 hover:bg-white/5">Edit Mode</Button>
            )}
        </div>
      </div>

      {/* Real Estate Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Building2 className="text-primary h-5 w-5" />
          <h3 className="text-xl font-semibold">Real Estate Portfolio</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Real Estate */}
            {(realEstate || []).map(p => (
                <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 p-4 relative">
                         <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur rounded-lg">
                            <Building2 className="h-5 w-5 text-slate-400" />
                         </div>
                         <h4 className="font-bold text-lg truncate pr-10">{p.name}</h4>
                         <p className="text-xs text-slate-400">{p.location}</p>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Value</label>
                            {isEditing ? (
                              <div className="flex gap-2 items-center">
                                <GlassInput 
                                    type="number" 
                                    value={p.currentValue}
                                    onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)}
                                />
                                <span className="text-xs font-mono">{p.currency}</span>
                              </div>
                            ) : (
                              <p className="font-mono text-2xl font-bold text-emerald-400">{formatNumber(p.currentValue)} <span className="text-sm text-muted-foreground">{p.currency}</span></p>
                            )}
                        </div>
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
                             <div className="font-mono font-medium">+{formatNumber(p.monthlyRent)} {p.rentCurrency || p.currency}</div>
                           )}
                        </div>
                        {isEditing && (
                          <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}>
                              <Trash2 className="h-4 w-4 mr-2" /> Remove Asset
                          </Button>
                        )}
                    </div>
                </div>
            ))}

            {/* Under Development */}
            {(underDevelopment || []).map(p => {
              const linkedInstallment = installments.find(i => i.id === p.linkedInstallmentId);
              const progress = linkedInstallment && !loading ? (linkedInstallment.paid / linkedInstallment.total) * 100 : 0;
              
              return (
                <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden group border-dashed border-white/20 hover:border-primary/50 transition-all">
                    <div className="h-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 relative">
                         <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur rounded-lg">
                            <Package className="h-5 w-5 text-purple-400" />
                         </div>
                         <h4 className="font-bold text-lg truncate pr-10">{p.name}</h4>
                         <p className="text-xs text-purple-300">Off-Plan • {p.location}</p>
                    </div>
                    <div className="p-5 space-y-4">
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Development Progress</span>
                                <span className="text-emerald-400 font-mono">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-white/10" />
                         </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Contract Price</label>
                              <p className="font-mono text-sm font-medium">{formatNumber(linkedInstallment?.total ?? p.purchasePrice)}</p>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                              {isEditing ? (
                                <GlassInput 
                                    type="number" 
                                    value={p.currentValue}
                                    onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)}
                                />
                              ) : (
                                <p className="font-mono text-sm font-bold text-purple-400">{formatNumber(p.currentValue)}</p>
                              )}
                          </div>
                        </div>
                        {isEditing && (
                          <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}>
                              <Trash2 className="h-4 w-4 mr-2" /> Remove Asset
                          </Button>
                        )}
                    </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Liquid Assets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Cash */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-semibold">
                <Wallet className="text-emerald-500 h-5 w-5" /> Cash Holdings
             </div>
             <div className="glass-panel p-1 rounded-xl space-y-1">
                 {(cash || []).map(item => (
                     <div key={item.id} className="group relative p-4 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center">
                        <div>
                            <p className="font-medium text-sm">{item.location}</p>
                            <p className="text-xs text-muted-foreground">Liquid</p>
                        </div>
                        <div className="text-right">
                             {isEditing ? (
                                <div className="flex gap-2 items-center">
                                    <GlassInput 
                                        type="number" 
                                        value={item.amount}
                                        className="w-28 text-right"
                                        onChange={(e: any) => handleAssetChange('cash', item.id, 'amount', e.target.value)}
                                    />
                                </div>
                             ) : (
                                <p className="text-lg font-mono font-bold text-emerald-400">{formatNumber(item.amount)}</p>
                             )}
                             <p className="text-xs font-mono text-muted-foreground">{item.currency}</p>
                        </div>
                        {isEditing && (
                            <button className="absolute -right-2 -top-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteTarget({ type: 'cash', id: item.id })}>
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                     </div>
                 ))}
             </div>
          </div>

          {/* Metals */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Gem className="text-amber-500 h-5 w-5" /> Precious Metals
                </div>
                <span className="text-xs text-muted-foreground bg-black/30 px-2 py-1 rounded-full border border-white/5">Live Simulation Active</span>
             </div>
             
             <div className="grid md:grid-cols-2 gap-4">
                 {/* Gold */}
                 <div className="glass-panel p-5 rounded-xl bg-gradient-to-br from-amber-900/10 to-transparent border-amber-500/20">
                    <h4 className="text-amber-500 font-bold flex items-center gap-2 mb-4"><Coins className="h-4 w-4" /> Gold Reserves</h4>
                    <div className="space-y-3">
                        {(gold || []).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg border border-amber-500/10">
                                <span className="text-sm">{item.location}</span>
                                {isEditing ? (
                                    <GlassInput 
                                        type="number" 
                                        value={item.grams}
                                        className="w-24 text-right"
                                        onChange={(e: any) => handleAssetChange('gold', item.id, 'grams', e.target.value)}
                                    />
                                ) : (
                                    <span className="font-mono font-bold">{formatNumber(item.grams)} <span className="text-xs text-amber-500/70">g</span></span>
                                )}
                                {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget({ type: 'gold', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Silver */}
                 <div className="glass-panel p-5 rounded-xl bg-gradient-to-br from-slate-800/30 to-transparent border-slate-500/20">
                    <h4 className="text-slate-300 font-bold flex items-center gap-2 mb-4"><Scale className="h-4 w-4" /> Silver Reserves</h4>
                    <div className="space-y-3">
                        {(silver || []).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg border border-slate-500/10">
                                <span className="text-sm">{item.location}</span>
                                {isEditing ? (
                                    <GlassInput 
                                        type="number" 
                                        value={item.grams}
                                        className="w-24 text-right"
                                        onChange={(e: any) => handleAssetChange('silver', item.id, 'grams', e.target.value)}
                                    />
                                ) : (
                                    <span className="font-mono font-bold">{formatNumber(item.grams)} <span className="text-xs text-slate-400/70">g</span></span>
                                )}
                                {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget({ type: 'silver', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
          </div>

      </div>

      {/* Other Assets */}
      {otherAssets.length > 0 && (
        <div className="glass-panel p-6 rounded-xl">
             <h3 className="text-lg font-semibold mb-4">Other Assets</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(otherAssets || []).map(item => (
                    <div key={item.id} className="p-4 bg-black/20 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="font-medium">{item.description}</span>
                        <div className="text-right">
                            {isEditing ? (
                                <GlassInput 
                                    type="number" 
                                    value={item.value}
                                    className="w-24"
                                    onChange={(e: any) => handleAssetChange('otherAssets', item.id, 'value', e.target.value)}
                                />
                            ) : (
                                <span className="font-mono font-bold">{formatNumber(item.value)} {item.currency}</span>
                            )}
                        </div>
                        {isEditing && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive ml-2" onClick={() => setDeleteTarget({ type: 'otherAssets', id: item.id })}><Trash2 className="h-3 w-3"/></Button>}
                    </div>
                ))}
             </div>
        </div>
      )}

      <AddAssetDialog
        isOpen={isAddAssetDialogOpen}
        onClose={() => setIsAddAssetDialogOpen(false)}
        onAddAsset={handleAddAsset}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the asset from your portfolio permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">Delete Asset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}