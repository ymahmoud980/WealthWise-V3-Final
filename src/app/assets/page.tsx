

"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, RealEstateAsset, UnderDevelopmentAsset, CashAsset, GoldAsset, OtherAsset, Installment, SilverAsset } from "@/lib/types";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { Trash2, Wallet, Gem, Scale, Package } from "lucide-react";
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
    // When editing starts, copy the main data to the editable state.
    // This prevents re-copying on every render while editing.
    if (isEditing) {
        setEditableData(JSON.parse(JSON.stringify(data)));
    }
  }, [isEditing, data]);


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    // No need to reset data here; the useEffect will handle it when editing starts again.
  };

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
                // Correctly handle type conversion for numeric fields
                (updatedAsset[field] as any) = typeof asset[field] === 'number'
                    ? parseFloat(value as string) || 0
                    : value;
                return updatedAsset;
            }
            return asset;
        });

        return {
            ...prevData,
            assets: {
                ...prevData.assets,
                [assetTypeKey]: updatedAssetList,
            },
        };
    });
  };

 const handleAddAsset = (newAsset: any, type: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));

    if (type === 'gold' || type === 'silver' || type === 'cash') {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existingAsset = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);

        if (existingAsset) {
            if (type === 'gold' || type === 'silver') {
                existingAsset.grams = Number(existingAsset.grams) + Number(newAsset.grams);
            } else { // cash
                 if (existingAsset.currency === newAsset.currency) {
                    existingAsset.amount = Number(existingAsset.amount) + Number(newAsset.amount);
                 } else {
                    const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
                    const assetWithId = { ...newAsset, id: newId };
                    (updatedData.assets[assetKey] as any[]).push(assetWithId);
                 }
            }
        } else {
            const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
            const assetWithId = { ...newAsset, id: newId };
            (updatedData.assets[assetKey] as any[]).push(assetWithId);
        }
    } else {
        const newId = `${type.substring(0, 2)}${new Date().getTime()}`;
        const assetWithId = { ...newAsset, id: newId };
        
        const assetKeyMap: { [key: string]: keyof FinancialData['assets'] } = {
            realEstate: 'realEstate',
            underDevelopment: 'underDevelopment',
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
                                  value={p.currentValue}
                                  onChange={(e) => handleAssetChange('realEstate', p.id, 'currentValue', e.target.value)}
                                  className="h-8 w-full"
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
                                  value={p.monthlyRent}
                                  onChange={(e) => handleAssetChange('realEstate', p.id, 'monthlyRent', e.target.value)}
                                  className="h-8 w-full"
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
                                    value={linkedInstallment?.total}
                                    onChange={(e) => handleAssetChange('underDevelopment', p.id, 'purchasePrice', e.target.value)}
                                    className="h-8 w-full"
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
                                    value={p.currentValue}
                                    onChange={(e) => handleAssetChange('underDevelopment', p.id, 'currentValue', e.target.value)}
                                    className="h-8 w-full"
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
                <h3 className="text-xl font-semibold mb-4">Cash, Metals &amp; Other Assets</h3>
                <div className="space-y-4">
                  {/* Cash Holdings */}
                  <Card>
                      <CardHeader><CardTitle className="text-lg">Cash Holdings</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                          {(cash || []).map(item => (
                              <div key={item.id} className="group relative p-3 bg-secondary rounded-md">
                                {isEditing && (
                                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'cash', id: item.id })}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <p className="font-semibold">{item.location}</p>
                                <div className="flex items-center justify-between gap-2">
                                  {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={item.amount}
                                        onChange={(e) => handleAssetChange('cash', item.id, 'amount', e.target.value)}
                                        className="h-8 mt-1"
                                    />
                                  ) : (
                                    <p className="text-lg font-bold">{formatNumber(item.amount)}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">{item.currency}</p>
                                </div>
                              </div>
                          ))}
                      </CardContent>
                  </Card>
                   {/* Gold Holdings */}
                   <Card className="bg-amber-100 dark:bg-amber-900/50">
                      <CardHeader><CardTitle className="text-lg">Gold Holdings</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                          {(gold || []).map(item => (
                              <div key={item.id} className="group relative p-3 bg-secondary rounded-md">
                                {isEditing && (
                                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'gold', id: item.id })}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <p className="font-semibold">{item.location}</p>
                                <div className="flex items-center justify-between gap-2">
                                  {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={item.grams}
                                        onChange={(e) => handleAssetChange('gold', item.id, 'grams', e.target.value)}
                                        className="h-8 mt-1"
                                    />
                                  ) : (
                                    <p className="text-lg font-bold">{formatNumber(item.grams)}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">grams</p>
                                </div>
                              </div>
                          ))}
                      </CardContent>
                  </Card>
                   {/* Silver Holdings */}
                   <Card>
                      <CardHeader><CardTitle className="text-lg">Silver Holdings</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                          {(silver || []).map(item => (
                              <div key={item.id} className="group relative p-3 bg-secondary rounded-md">
                                {isEditing && (
                                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'silver', id: item.id })}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <p className="font-semibold">{item.location}</p>
                                <div className="flex items-center justify-between gap-2">
                                  {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={item.grams}
                                        onChange={(e) => handleAssetChange('silver', item.id, 'grams', e.target.value)}
                                        className="h-8 mt-1"
                                    />
                                  ) : (
                                    <p className="text-lg font-bold">{formatNumber(item.grams)}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">grams</p>
                                </div>
                              </div>
                          ))}
                      </CardContent>
                  </Card>
                  {/* Other Assets */}
                  <Card>
                      <CardHeader><CardTitle className="text-lg">Other Assets</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                           {(otherAssets || []).map(item => (
                              <div key={item.id} className="group relative p-3 bg-secondary rounded-md">
                                {isEditing && (
                                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'otherAssets', id: item.id })}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <p className="font-semibold">{item.description}</p>
                                <div className="flex items-center justify-between gap-2">
                                  {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={item.value}
                                        onChange={(e) => handleAssetChange('otherAssets', item.id, 'value', e.target.value)}
                                        className="h-8 mt-1"
                                    />
                                  ) : (
                                    <p className="text-lg font-bold">{formatNumber(item.value)}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">{item.currency}</p>
                                </div>
                              </div>
                          ))}
                      </CardContent>
                  </Card>
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

    
