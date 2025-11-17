
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
    // This is the correct way to sync the editable state with the main data context.
    // It should only run when the main data changes, or when editing starts/stops.
    setEditableData(JSON.parse(JSON.stringify(data)));
  }, [data, isEditing]);


  const handleEditClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data))); // Ensure fresh data on edit start
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
  };

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

    if (type === 'gold' || type === 'silver' || type === 'cash') {
        const assetKey = type as 'gold' | 'silver' | 'cash';
        const existingAsset = updatedData.assets[assetKey].find((a: any) => a.location === newAsset.location);

        if (existingAsset) {
            if (type === 'gold' || type === 'silver') {
                existingAsset.grams = Number(existingAsset.grams) + Number(newAsset.grams);
            } else { // cash
                 // For cash, if currencies match, add amounts. Otherwise, do nothing for now.
                 // A more complex implementation could create a new entry if currency is different.
                 if (existingAsset.currency === newAsset.currency) {
                    existingAsset.amount = Number(existingAsset.amount) + Number(newAsset.amount);
                 } else {
                    // If currency is different for the same location, create a new entry
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
  
  const AssetSubCard = ({
    title,
    icon,
    items,
    valueKey,
    unit,
    currencyKey,
    type,
    colorClass,
    handleItemChange
  }: {
    title: string;
    icon: React.ReactNode;
    items: any[];
    valueKey: string;
    unit: string;
    currencyKey?: string;
    type: string;
    colorClass: string;
    handleItemChange: (id: string, field: any, value: string | number) => void;
  }) => {
    const total = items.reduce((acc, item) => acc + (Number(item[valueKey]) || 0), 0);
    return (
    <Card className={`overflow-hidden ${colorClass} flex flex-col`}>
      <CardHeader className="p-4 bg-background/50">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm space-y-3 flex-grow">
        {items.map(item => (
          <div key={item.id} className="group relative bg-background/50 p-3 rounded-md">
            {isEditing && (
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => setDeleteTarget({ type, id: item.id })}>
                  <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <p className="font-semibold">{item.location || item.description}</p>
            <div className="flex items-end justify-between gap-2">
              {isEditing ? (
                <Input 
                    type="number" 
                    defaultValue={item[valueKey]}
                    onChange={(e) => handleItemChange(item.id, valueKey, e.target.value)}
                    className="h-8 mt-1 w-full"
                />
              ) : (
                <p className="text-xl font-bold">{formatNumber(item[valueKey])}</p>
              )}
              <p className="text-xs text-muted-foreground shrink-0">{currencyKey ? item[currencyKey] : unit}</p>
            </div>
          </div>
        ))}
      </CardContent>
      {(type === 'gold' || type === 'silver') && (
        <CardFooter className="p-4 bg-background/50 mt-auto">
            <div className="flex justify-between items-center w-full">
                <p className="font-semibold text-sm">Total Grams</p>
                <p className="font-bold text-lg">{formatNumber(total)}</p>
            </div>
        </CardFooter>
      )}
    </Card>
    )
  };

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
                                  defaultValue={p.monthlyRent}
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
                                    defaultValue={linkedInstallment?.total}
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
                                    defaultValue={p.currentValue}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AssetSubCard 
                        title="Cash Holdings"
                        icon={<Wallet className="text-green-600" />}
                        items={cash || []}
                        valueKey="amount"
                        unit=""
                        currencyKey="currency"
                        type="cash"
                        colorClass="bg-green-50"
                        handleItemChange={(id, field, value) => handleAssetChange('cash', id, field, value)}
                    />
                     <AssetSubCard 
                        title="Gold Holdings"
                        icon={<Gem className="text-yellow-500" />}
                        items={gold || []}
                        valueKey="grams"
                        unit="grams"
                        type="gold"
                        colorClass="bg-yellow-50"
                        handleItemChange={(id, field, value) => handleAssetChange('gold', id, field, value)}
                    />
                     <AssetSubCard 
                        title="Silver Holdings"
                        icon={<Scale className="text-slate-400" />}
                        items={silver || []}
                        valueKey="grams"
                        unit="grams"
                        type="silver"
                        colorClass="bg-slate-100"
                        handleItemChange={(id, field, value) => handleAssetChange('silver', id, field, value)}
                    />
                     <AssetSubCard 
                        title="Other Assets"
                        icon={<Package className="text-blue-500" />}
                        items={otherAssets || []}
                        valueKey="value"
                        unit=""
                        currencyKey="currency"
                        type="otherAssets"
                        colorClass="bg-blue-50"
                        handleItemChange={(id, field, value) => handleAssetChange('otherAssets', id, field, value)}
                    />
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
