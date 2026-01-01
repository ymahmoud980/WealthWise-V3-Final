"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Need to ensure you have this UI component or use standard textarea
import { useFinancialData } from "@/contexts/FinancialDataContext"
import { useAuth } from "@/contexts/AuthContext"
import type { FinancialData, RealEstateAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Package, Building2, Paperclip, Calendar, Loader2, FileText, Download, MapPin, StickyNote } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/firebase"; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; 

const GlassInput = (props: any) => (
  <Input {...props} className={cn("bg-black/20 border-white/10 text-foreground focus:ring-primary/50 h-7 text-xs px-2", props.className)} />
);

export default function AssetsPage() {
  const { data, setData } = useFinancialData();
  const { user } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);
  
  const [viewAttachments, setViewAttachments] = useState<{name: string, id: string, docs?: any[]} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) setEditableData(JSON.parse(JSON.stringify(data))); }, [isEditing, data]);

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => { setData(editableData); setIsEditing(false); };
  const handleCancelClick = () => setIsEditing(false);

  // --- UPLOAD LOGIC ---
  const handleUploadClick = () => attachmentInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewAttachments || !user || !storage) return;
    setIsUploading(true);
    try {
        const storageRef = ref(storage, `assets/${user.uid}/${viewAttachments.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const newDoc = { name: file.name, url: downloadURL, date: new Date().toLocaleDateString() };
        
        const updatedData = JSON.parse(JSON.stringify(data));
        let asset = updatedData.assets.realEstate.find((a:any) => a.id === viewAttachments.id);
        if(!asset) asset = updatedData.assets.underDevelopment.find((a:any) => a.id === viewAttachments.id);
        
        if(asset) {
            if(!asset.documents) asset.documents = [];
            asset.documents.push(newDoc);
            setData(updatedData); 
            setViewAttachments(prev => ({ ...prev!, docs: asset.documents }));
        }
    } catch (error) { alert("Upload failed."); } finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleDeleteDocument = async (docName: string) => {
    if(!confirm("Delete document?")) return;
    try {
        try { await deleteObject(ref(storage, `assets/${user?.uid}/${viewAttachments?.id}/${docName}`)); } catch(e){}
        const updatedData = JSON.parse(JSON.stringify(data));
        let asset = updatedData.assets.realEstate.find((a:any) => a.id === viewAttachments?.id);
        if(!asset) asset = updatedData.assets.underDevelopment.find((a:any) => a.id === viewAttachments?.id);
        if(asset && asset.documents) {
            asset.documents = asset.documents.filter((d: any) => d.name !== docName);
            setData(updatedData);
            setViewAttachments(prev => ({ ...prev!, docs: asset.documents }));
        }
    } catch (error) { alert("Delete failed."); }
  };

  // --- ADD LOGIC ---
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
            currency: newAsset.currency, frequency: newAsset.paymentFrequency || 'Quarterly',
            paymentHistory: [] 
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
    const updatedData = JSON.parse(JSON.stringify(data));
    const key = deleteTarget.type === 'other' ? 'otherAssets' : deleteTarget.type as keyof FinancialData['assets'];
    if (updatedData.assets[key]) updatedData.assets[key] = updatedData.assets[key].filter((item: any) => item.id !== deleteTarget.id);
    if (deleteTarget.type === 'underDevelopment') {
       const asset = data.assets.underDevelopment.find(a => a.id === deleteTarget.id);
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
          if (idx > -1) {
             const isString = ['name','location','currency','rentFrequency','notes'].includes(field);
             list[idx][field] = isString ? val : (parseFloat(val) || 0);
          }
          return { ...prev };
      });
  };

  // Grouping
  const groupedAssets: Record<string, RealEstateAsset[]> = {};
  (realEstate || []).forEach(asset => {
    const loc = asset.location || "Uncategorized";
    if (!groupedAssets[loc]) groupedAssets[loc] = [];
    groupedAssets[loc].push(asset);
  });
  const groupedDevelopment: Record<string, any[]> = {};
  (underDevelopment || []).forEach(asset => {
    const loc = asset.location || "Uncategorized";
    if (!groupedDevelopment[loc]) groupedDevelopment[loc] = [];
    groupedDevelopment[loc].push(asset);
  });

  return (
    <div className="space-y-10 pb-20">
      <input type="file" ref={attachmentInputRef} onChange={handleFileChange} className="hidden" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Holdings</h1><p className="text-muted-foreground mt-1">Portfolio Breakdown</p></div>
        <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setIsAddAssetDialogOpen(true)}>+ Add Asset</Button>
            <Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSaveClick : handleEditClick}>{isEditing ? "Save Changes" : "Edit Mode"}</Button>
            {isEditing && <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>}
        </div>
      </div>

      {/* READY PROPERTIES */}
      <div className="space-y-8">
        {Object.entries(groupedAssets).map(([location, assets]) => (
            <div key={location} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-2"><MapPin className="h-4 w-4 text-emerald-500" /> {location}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(p => (
                        <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-white/5 shadow-md group">
                            <div className="bg-secondary/50 p-4 border-b border-white/5 flex justify-between items-start">
                                <div>
                                    {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg">{p.name}</h4>}
                                    <p className="text-xs text-muted-foreground">{p.location}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white relative" onClick={() => setViewAttachments({ name: p.name, id: p.id, docs: (p as any).documents || [] })}><Paperclip className="h-4 w-4" />{((p as any).documents?.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>}</Button>
                            </div>
                            <div className="p-5 space-y-4 bg-card/40">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Value</label>
                                    {isEditing ? <div className="flex gap-2"><GlassInput type="number" value={p.currentValue} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)} /><GlassInput className="w-16" value={p.currency} onChange={(e: any) => handleAssetChange('realEstate', p.id, 'currency', e.target.value)} /></div> : <p className="text-2xl font-bold text-emerald-500">{formatNumber(p.currentValue)} {p.currency}</p>}
                                </div>
                                {/* NEW: NOTES FIELD */}
                                {(p.notes || isEditing) && (
                                    <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                        <label className="text-[10px] text-amber-500 flex items-center gap-1"><StickyNote className="h-3 w-3"/> Notes</label>
                                        {isEditing ? <textarea className="w-full bg-transparent text-xs text-white border-0 focus:ring-0 p-0" rows={2} value={p.notes || ""} onChange={(e) => handleAssetChange('realEstate', p.id, 'notes', e.target.value)} placeholder="Add private notes..." /> : <p className="text-xs text-slate-300 italic">{p.notes}</p>}
                                    </div>
                                )}
                                {isEditing && <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* OFF PLAN */}
      <div className="space-y-8 pt-6 border-t border-dashed border-white/10">
        {Object.entries(groupedDevelopment).map(([location, assets]) => (
            <div key={location} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-2"><MapPin className="h-4 w-4 text-purple-500" /> {location}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(p => {
                        const linkedInstallment = installments.find(i => i.id === p.linkedInstallmentId);
                        const progress = linkedInstallment && linkedInstallment.total > 0 ? (linkedInstallment.paid / linkedInstallment.total) * 100 : 0;
                        const base = p.purchasePrice || 0; const maint = p.maintenanceCost || 0; const park = p.parkingCost || 0; const total = base + maint + park;

                        return (
                            <div key={p.id} className="glass-panel p-0 rounded-xl overflow-hidden border border-dashed border-purple-500/30 group">
                                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-4 border-b border-white/5 flex justify-between items-start">
                                    <div className="flex-1">
                                        {isEditing ? <GlassInput value={p.name} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'name', e.target.value)} className="font-bold w-full mb-1"/> : <h4 className="font-bold text-lg">{p.name}</h4>}
                                        <p className="text-xs text-purple-300">Off-Plan • {p.location}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300/50 hover:text-white" onClick={() => setViewAttachments({ name: p.name, id: p.id, docs: (p as any).documents || [] })}><Paperclip className="h-4 w-4" />{((p as any).documents?.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>}</Button>
                                </div>
                                <div className="p-5 space-y-4 bg-black/20">
                                    <div className="space-y-1"><div className="flex justify-between text-xs text-muted-foreground"><span>Paid: {progress.toFixed(1)}%</span><span>Total: {formatNumber(total)}</span></div><Progress value={progress} className="h-1.5 bg-white/10" /></div>
                                    <div className="bg-white/5 p-3 rounded-lg text-xs space-y-2 border border-white/5">
                                        <div className="flex justify-between items-center text-muted-foreground"><span>Contract:</span> {isEditing ? <GlassInput className="w-24 text-right" type="number" value={base} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'purchasePrice', e.target.value)} /> : <span>{formatNumber(base)}</span>}</div>
                                        <div className="flex justify-between items-center text-purple-300"><span>Maint:</span>{isEditing ? <GlassInput className="w-24 text-right" type="number" value={maint} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'maintenanceCost', e.target.value)} /> : <span>{formatNumber(maint)}</span>}</div>
                                        <div className="flex justify-between items-center text-purple-300"><span>Parking:</span>{isEditing ? <GlassInput className="w-24 text-right" type="number" value={park} onChange={(e: any) => handleAssetChange('underDevelopment', p.id, 'parkingCost', e.target.value)} /> : <span>{formatNumber(park)}</span>}</div>
                                        <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-1 text-white"><span>Total:</span> <span>{formatNumber(total)} {p.currency}</span></div>
                                    </div>
                                    {/* NEW: NOTES FIELD */}
                                    {(p.notes || isEditing) && (
                                        <div className="bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                                            <label className="text-[10px] text-indigo-400 flex items-center gap-1"><StickyNote className="h-3 w-3"/> Notes</label>
                                            {isEditing ? <textarea className="w-full bg-transparent text-xs text-white border-0 focus:ring-0 p-0" rows={2} value={p.notes || ""} onChange={(e) => handleAssetChange('underDevelopment', p.id, 'notes', e.target.value)} placeholder="Add private notes..." /> : <p className="text-xs text-slate-300 italic">{p.notes}</p>}
                                        </div>
                                    )}
                                    {isEditing && <Button variant="destructive" size="sm" className="w-full" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}><Trash2 className="h-4 w-4 mr-2" /> Remove</Button>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        ))}
      </div>

      <Dialog open={!!viewAttachments} onOpenChange={() => setViewAttachments(null)}>
        <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Documents: {viewAttachments?.name}</DialogTitle><DialogDescription>Contracts, receipts, and deeds.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {viewAttachments?.docs && viewAttachments.docs.length > 0 ? (viewAttachments.docs.map((doc: any, i: number) => (<div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-white/10 group"><div className="flex items-center gap-2 overflow-hidden"><FileText className="h-4 w-4 text-emerald-500 shrink-0" /><span className="text-sm truncate">{doc.name}</span></div><div className="flex items-center gap-2"><a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-md text-emerald-400"><Download className="h-4 w-4" /></a><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteDocument(doc.name)}><Trash2 className="h-4 w-4" /></Button></div></div>))) : (<p className="text-center text-sm text-muted-foreground py-4 border-2 border-dashed border-white/10 rounded-lg">No documents yet.</p>)}
                </div>
                <div className="pt-2 border-t border-white/10 text-center">{isUploading ? <Button disabled className="w-full bg-emerald-600/50"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</Button> : <Button onClick={handleUploadClick} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Upload New File</Button>}</div>
            </div>
        </DialogContent>
      </Dialog>

      <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={() => setIsAddAssetDialogOpen(false)} onAddAsset={handleAddAsset} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-panel"><AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}