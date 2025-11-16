

"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, RealEstateAsset, UnderDevelopmentAsset, CashAsset, GoldAsset, OtherAsset, Installment, SilverAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2 } from "lucide-react";
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


export default function AssetsPage() {
  const { data, setData, loading } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(data);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  useEffect(() => {
    // When the global data changes (e.g., from an import), reset the editable data
    // but only if we are not currently in editing mode.
    if (!isEditing) {
      setEditableData(JSON.parse(JSON.stringify(data)));
    }
  }, [data, isEditing]);


  const handleEditClick = () => {
    // When entering edit mode, create a fresh copy of the current global state.
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // When saving, push the edited data to the global context.
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    // When cancelling, discard the local edits and leave edit mode.
    // The component will re-sync with the global state via the useEffect hook.
    setIsEditing(false);
  };

  // Generic handler to update a field in any asset list
  const handleAssetChange = <T extends { id: string }>(
    assetTypeKey: keyof FinancialData['assets'],
    id: string,
    field: keyof T,
    value: string | number
  ) => {
    setEditableData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const assetList = newData.assets[assetTypeKey] as T[];
      const asset = assetList.find(a => a.id === id);
      if (asset) {
        (asset[field] as any) = typeof (asset[field]) === 'number' ? parseFloat(value as string) || 0 : value;
      }
      return newData;
    });
  };

  const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));

    if (type === 'gold' || type === 'silver') {
        const assetKey = type === 'gold' ? 'gold' : 'silver';
        const existingAsset = updatedData.assets[assetKey].find((a: GoldAsset | SilverAsset) => a.location === newAsset.location);

        if (existingAsset) {
            existingAsset.grams += newAsset.grams;
        } else {
            const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
            const assetWithId = { ...newAsset, id: newId };
            updatedData.assets[assetKey].push(assetWithId);
        }
    } else {
        const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
        const assetWithId = { ...newAsset, id: newId };
        
        const assetKeyMap: { [key: string]: keyof FinancialData['assets'] } = {
            realEstate: 'realEstate',
            underDevelopment: 'underDevelopment',
            cash: 'cash',
            other: 'otherAssets',
        };

        const assetKey = assetKeyMap[type];
        if (assetKey) {
            if (!updatedData.assets[assetKey]) {
                (updatedData.assets as any)[assetKey] = [];
            }
            (updatedData.assets[assetKey] as any[]).push(assetWithId);
        }
    }

    setData(updatedData);

    if (isEditing) {
        setEditableData(updatedData);
    }
    
    setIsAddAssetDialogOpen(false);
  };


  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    // Always start with a fresh copy of the global data
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
    
    // Immediately update the global state.
    setData(updatedData);

    // If in editing mode, sync the local state.
    if (isEditing) {
        setEditableData(updatedData);
    }

    setDeleteTarget(null);
  };


  const formatNumber = (num: number) => num.toLocaleString();

  // Determine which data to display based on the editing state.
  const currentData = isEditing ? editableData : data;
  const { realEstate, underDevelopment, cash, gold, silver, otherAssets } = currentData.assets;
  const { installments } = currentData.liabilities;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Asset Overview</CardTitle>
            <CardDescription>Detailed breakdown of all your assets. Click "Edit" to make changes.</CardDescription>
          </div>
          <div className="flex gap-2">
             <Button onClick={() => setIsAddAssetDialogOpen(true)}>Add New Asset</Button>
            {isEditing ? (
              <>
                <Button onClick={handleSaveClick}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancelClick}>Cancel</Button>
              </>
            ) : (
              <Button onClick={handleEditClick}>Edit</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Real Estate (Existing)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(realEstate || []).map(p => (
                      <div key={p.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'realEstate', id: p.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.location}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Value ({p.currency})</label>
                            {isEditing ? (
                              <Input 
                                  type="number" 
                                  defaultValue={p.currentValue}
                                  onChange={(e) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)}
                                  className="h-8"
                              />
                            ) : (
                              <p className="font-medium">{formatNumber(p.currentValue)}</p>
                            )}
                          </div>
                           <div className="space-y-1">
                            <label className="text-xs font-medium">Rent ({p.rentCurrency || p.currency} / {p.rentFrequency})</label>
                            {isEditing ? (
                               <Input 
                                  type="number" 
                                  defaultValue={p.monthlyRent}
                                  onChange={(e) => handleAssetChange('realEstate', p.id, 'monthlyRent', e.target.value)}
                                  className="h-8"
                                  disabled={p.monthlyRent === 0 && !isEditing}
                               />
                            ) : (
                               <p className="font-medium">{formatNumber(p.monthlyRent)}</p>
                            )}
                          </div>
                      </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Real Estate (Under Development)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(underDevelopment || []).map(p => {
                    const linkedInstallment = installments.find(i => i.id === p.linkedInstallmentId);
                    const progress = linkedInstallment && !loading ? (linkedInstallment.paid / linkedInstallment.total) * 100 : 0;
                    
                    return (
                      <div key={p.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'underDevelopment', id: p.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-sm text-muted-foreground">{p.location}</p>
                                </div>
                                <span className="text-sm font-semibold text-green-700">{loading ? '0.0' : progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="my-2 h-2" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Total Price ({p.currency}) (incl. Maint.)</label>
                                {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={linkedInstallment?.total}
                                    onChange={(e) => handleAssetChange('underDevelopment', p.id, 'purchasePrice', e.target.value)}
                                    className="h-8"
                                    disabled // This should be driven by the installment data
                                />
                                ) : (
                                <p className="font-medium">{formatNumber(linkedInstallment?.total ?? p.purchasePrice)}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Current Value ({p.currency})</label>
                                {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={p.currentValue}
                                    onChange={(e) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)}
                                    className="h-8"
                                />
                                ) : (
                                <p className="font-medium">{formatNumber(p.currentValue)}</p>
                                )}
                            </div>
                          </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Cash, Gold & Other Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(cash || []).map(c => (
                        <div key={c.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                           {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'cash', id: c.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                           <p className="font-bold">Cash <span className="font-normal text-muted-foreground">- {c.location}</span></p>
                           <div className="space-y-1">
                             <label className="text-xs font-medium">Amount ({c.currency})</label>
                             {isEditing ? (
                               <Input 
                                  type="number" 
                                  defaultValue={c.amount}
                                  onChange={(e) => handleAssetChange('cash', c.id, 'amount', e.target.value)}
                                  className="h-8"
                                />
                             ) : (
                               <p className="font-medium">{formatNumber(c.amount)}</p>
                             )}
                           </div>
                        </div>
                    ))}
                    {(gold || []).map(g => (
                      <div key={g.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'gold', id: g.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <p className="font-bold">Gold <span className="font-normal text-muted-foreground">- {g.location}</span></p>
                          <div className="space-y-1">
                              <label className="text-xs font-medium">Grams</label>
                              {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={g.grams}
                                    onChange={(e) => handleAssetChange('gold', g.id, 'grams', e.target.value)}
                                    className="h-8"
                                />
                              ) : (
                                <p className="font-medium">{formatNumber(g.grams)}</p>
                              )}
                            </div>
                      </div>
                    ))}
                    {(silver || []).map(s => (
                      <div key={s.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'silver', id: s.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <p className="font-bold">Silver <span className="font-normal text-muted-foreground">- {s.location}</span></p>
                          <div className="space-y-1">
                              <label className="text-xs font-medium">Grams</label>                              
                              {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={s.grams}
                                    onChange={(e) => handleAssetChange('silver', s.id, 'grams', e.target.value)}
                                    className="h-8"
                                />
                              ) : (
                                <p className="font-medium">{formatNumber(s.grams)}</p>
                              )}
                            </div>
                      </div>
                    ))}
                    {(otherAssets || []).map(o => (
                         <div key={o.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                            {isEditing && (
                              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'other', id: o.id })}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <p className="font-bold">{o.description}</p>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Value ({o.currency})</label>
                                {isEditing ? (
                                  <Input 
                                      type="number" 
                                      defaultValue={o.value}
                                      onChange={(e) => handleAssetChange('otherAssets', o.id, 'value', e.target.value)}
                                      className="h-8"
                                  />
                                ) : (
                                  <p className="font-medium">{formatNumber(o.value)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
      <AddAssetDialog
        isOpen={isAddAssetDialogOpen}
        onClose={() => setIsAddAssetDialogOpen(false)}
        onAddAsset={handleAddAsset}
      />
       <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this asset from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

    

    