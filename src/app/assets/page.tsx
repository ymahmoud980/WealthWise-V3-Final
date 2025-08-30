
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/contexts/FinancialDataContext"
import type { FinancialData, RealEstateAsset } from "@/lib/types";
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


export default function AssetsPage() {
  const { data, setData } = useFinancialData();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<FinancialData>(JSON.parse(JSON.stringify(data)));
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);


  const handleEditClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setData(editableData);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
    setIsEditing(false);
  };

  const handleRealEstateChange = (id: string, key: 'currentValue' | 'monthlyRent', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const asset = newData.assets.realEstate.find(a => a.id === id);
    if (asset) {
      asset[key] = numericValue;
      setEditableData(newData);
    }
  };

  const handleOtherAssetChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const asset = newData.assets.otherAssets.find(a => a.id === id);
    if (asset) {
      asset.value = numericValue;
      setEditableData(newData);
    }
  };
  
  const handleCashChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    const asset = newData.assets.cash.find(a => a.id === id);
    if (asset) {
      asset.amount = numericValue;
      setEditableData(newData);
    }
  };

  const handleGoldChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newData = { ...editableData };
    newData.assets.gold[0].grams = numericValue;
    setEditableData(newData);
  };
  
  const handleAddAsset = (newAsset: Omit<RealEstateAsset, 'id' | 'rentDueDay' | 'rentFrequency' | 'nextRentDueDate'>) => {
    const fullAsset: RealEstateAsset = {
      ...newAsset,
      id: `re${new Date().getTime()}`,
      rentDueDay: 1,
      rentFrequency: 'monthly',
      nextRentDueDate: new Date().toISOString().split('T')[0],
    };

    const updatedData = {
      ...data,
      assets: {
        ...data.assets,
        realEstate: [...data.assets.realEstate, fullAsset],
      },
    };
    setData(updatedData);
    setIsAddAssetDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    const updatedData = JSON.parse(JSON.stringify(data));

    if (type === 'realEstate') {
        updatedData.assets.realEstate = updatedData.assets.realEstate.filter((item: any) => item.id !== id);
    } else if (type === 'cash') {
        updatedData.assets.cash = updatedData.assets.cash.filter((item: any) => item.id !== id);
    } else if (type === 'gold') {
        updatedData.assets.gold = updatedData.assets.gold.filter((item: any) => item.id !== id);
    } else if (type === 'other') {
        updatedData.assets.otherAssets = updatedData.assets.otherAssets.filter((item: any) => item.id !== id);
    }

    setData(updatedData);
    setDeleteTarget(null);
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const currentData = isEditing ? editableData : data;
  const { realEstate, cash, gold, otherAssets } = currentData.assets;
  const offPlanAssets = currentData.liabilities.installments;

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
                  {realEstate.map(p => (
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
                                  onBlur={(e) => handleRealEstateChange(p.id, 'currentValue', e.target.value)}
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
                                  onBlur={(e) => handleRealEstateChange(p.id, 'monthlyRent', e.target.value)}
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
                  {offPlanAssets.map(p => (
                      <div key={p.id} className="p-4 bg-secondary rounded-lg">
                          <p className="font-bold">{p.project}</p>
                           <p className="text-sm font-semibold mt-2">Current Asset Value: {formatNumber(p.paid * 2)} {p.currency}</p>
                           <p className="text-xs text-muted-foreground mt-1">(Calculated as 2x amount paid)</p>
                      </div>
                  ))}
              </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Cash, Gold & Other Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cash.map(c => (
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
                                  onBlur={(e) => handleCashChange(c.id, e.target.value)}
                                  className="h-8"
                                />
                             ) : (
                               <p className="font-medium">{formatNumber(c.amount)}</p>
                             )}
                           </div>
                        </div>
                    ))}
                    {gold.map(g => (
                      <div key={g.id} className="p-4 bg-secondary rounded-lg space-y-2 group relative">
                          {isEditing && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteTarget({ type: 'gold', id: g.id })}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <p className="font-bold">Gold Bars</p>
                          <div className="space-y-1">
                              <label className="text-xs font-medium">Grams</label>
                              {isEditing ? (
                                <Input 
                                    type="number" 
                                    defaultValue={g.grams}
                                    onBlur={(e) => handleGoldChange(e.target.value)}
                                    className="h-8"
                                />
                              ) : (
                                <p className="font-medium">{formatNumber(g.grams)}</p>
                              )}
                            </div>
                      </div>
                    ))}
                    {otherAssets.map(o => (
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
                                      onBlur={(e) => handleOtherAssetChange(o.id, e.target.value)}
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
