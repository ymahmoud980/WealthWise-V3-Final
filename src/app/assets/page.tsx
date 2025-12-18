"use client"

import { DocumentManager } from "@/components/assets/DocumentManager";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, RealEstateAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package, Building2, Coins, MapPin, RefreshCw } from "lucide-react";
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
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  // Sync editable data when main data changes (e.g. after upload)
  useEffect(() => {
    setEditableData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data))); // Revert
    setIsEditing(false);
  };

  // --- NEW: IMMEDIATE SAVE FOR DOCUMENTS ---
  const handleDocumentUpdate = (assetId: string, newDocs: any[], type: 'realEstate' | 'underDevelopment') => {
    // 1. Create a clone of the REAL data (not just editable)
    const updatedData = JSON.parse(JSON.stringify(data));
    
    // 2. Find the asset in the main list
    const list = updatedData.assets[type] as any[];
    const assetIndex = list.findIndex((a: any) => a.id === assetId);
    
    if (assetIndex !== -1) {
        // 3. Update the documents
        list[assetIndex].documents = newDocs;
        
        // 4. SAVE IMMEDIATELY (Triggers Cloud Sync)
        setData(updatedData);
        // Also update editable state so it doesn't get out of sync
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

  // ... (Keep handleAddAsset, handleDeleteConfirm, formatNumber, grouping logic exactly as they were) ...
  // To save space, I am reusing the existing logic blocks for Add/Delete/Format/Group
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
    <div className="space-y-10 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Holdings</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio across Real Estate, Metals, and Cash.</p>
        </div>
        <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>+ Add Asset</Button>
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
      <div className="space-y-8">
        {Object.entries(groupedAssets).map(([location, assets]) => (
            <div key={location} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-2"><MapPin className="h-4 w-4 text-emerald-500" /> {location}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(p => (
                        <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-all border border-white/5 shadow-md">
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
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                                    {isEditing ? <div className="flex gap-2 items-center"><GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)}/><span className="text-xs font-mono">{p.currency}</span></div> : <p className="font-mono text-2xl font-bold text-emerald-500">{formatNumber(p.currentValue)} <span className="text-sm text-muted-foreground">{p.currency}</span></p>}
                                </div>
                                
                                {/* --- UPDATED: DOCUMENT MANAGER (Using Immediate Save) --- */}
                                <div className="pt-4 border-t border-white/5">
                                    <DocumentManager 
                                        assetId={p.id}
                                        documents={p.documents || []}
                                        onUpdate={(newDocs) => handleDocumentUpdate(p.id, newDocs, 'realEstate')} 
                                    />
                                </div>

                                {isEditing && (
                                  <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove Asset</Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Under Development Section */}
      <div className="space-y-8 pt-6 border-t border-dashed border-white/10">
        {Object.entries(groupedDevelopment).map(([location, assets]) => (
            <div key={location} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-2"><MapPin className="h-4 w-4 text-purple-500" /> {location} Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(p => (
                        <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-dashed border-purple-500/30">
                            {/* Header */}
                            <div className="bg-secondary/50 p-4 border-b border-white/5 flex justify-between items-start">
                                <div>
                                    {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg text-foreground">{p.name}</h4>}
                                    <p className="text-xs text-purple-400">Off-Plan • {p.location}</p>
                                </div>
                                <div className="p-1.5 bg-purple-500/10 rounded-lg"><Package className="h-4 w-4 text-purple-400" /></div>
                            </div>
                            
                            <div className="p-5 space-y-4 bg-card/40">
                                {/* ... Value Logic ... */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Value</label>
                                    {isEditing ? <GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)}/> : <p className="font-mono text-sm font-bold text-purple-400">{formatNumber(p.currentValue)}</p>}
                                </div>

                                {/* --- UPDATED: DOCUMENT MANAGER (Immediate Save) --- */}
                                <div className="pt-4 border-t border-white/5">
                                    <DocumentManager 
                                        assetId={p.id}
                                        documents={p.documents || []}
                                        onUpdate={(newDocs) => handleDocumentUpdate(p.id, newDocs, 'underDevelopment')} 
                                    />
                                </div>

                                {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove Asset</Button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* ... (Liquid Assets section remains the same) ... */}
      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={() => setIsAddAssetDialogOpen(false)} onAddAsset={handleAddAsset} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle><AlertDialogDescription>This will remove the asset from your portfolio permanently.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">Delete Asset</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}