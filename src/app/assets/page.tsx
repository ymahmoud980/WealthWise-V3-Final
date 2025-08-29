
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

import { initialFinancialData } from "@/lib/data"
import type { FinancialData } from "@/lib/types"

export default function AssetsPage() {
  const [data, setData] = useState<FinancialData>(initialFinancialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleRealEstateChange = (id: string, key: 'currentValue' | 'monthlyRent', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prevData => ({
      ...prevData,
      assets: {
        ...prevData.assets,
        realEstate: prevData.assets.realEstate.map(asset =>
          asset.id === id ? { ...asset, [key]: numericValue } : asset
        ),
      },
    }));
  };

  const handleOtherAssetChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prevData => ({
        ...prevData,
        assets: {
            ...prevData.assets,
            otherAssets: prevData.assets.otherAssets.map(asset =>
                asset.id === id ? { ...asset, value: numericValue } : asset
            )
        }
    }));
  };
  
    const handleCashChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prevData => ({
        ...prevData,
        assets: {
            ...prevData.assets,
            cash: prevData.assets.cash.map(asset =>
                asset.id === id ? { ...asset, amount: numericValue } : asset
            )
        }
    }));
  };

  const handleGoldChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prevData => ({
        ...prevData,
        assets: {
            ...prevData.assets,
            gold: [{ ...prevData.assets.gold[0], grams: numericValue }]
        }
    }));
  };

  const handleSave = () => {
    // In a real app, this would send the updated `data` to a server/API
    console.log("Saving data:", data);
    setIsEditing(false); 
    // For now, we just reflect the changes in the local state.
    // You could add a toast notification here for user feedback.
  };

  const { realEstate, cash, gold, otherAssets } = data.assets;
  const offPlanAssets = data.liabilities.installments;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Asset Overview</CardTitle>
            <CardDescription>Detailed breakdown of all your assets.</CardDescription>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Real Estate (Existing)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realEstate.map(p => (
                      <div key={p.id} className="p-4 bg-secondary rounded-lg space-y-2">
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.location}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Value ({p.currency})</label>
                            <Input 
                                type="number" 
                                value={p.currentValue}
                                onChange={(e) => handleRealEstateChange(p.id, 'currentValue', e.target.value)}
                                className="h-8"
                             />
                          </div>
                           <div className="space-y-1">
                            <label className="text-xs font-medium">Rent ({p.rentCurrency || p.currency} / {p.rentFrequency})</label>
                             <Input 
                                type="number" 
                                value={p.monthlyRent}
                                onChange={(e) => handleRealEstateChange(p.id, 'monthlyRent', e.target.value)}
                                className="h-8"
                                disabled={p.monthlyRent === 0}
                             />
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
                           <p className="text-sm font-semibold mt-2">Current Asset Value: {(p.paid * 2).toLocaleString()} {p.currency}</p>
                           <p className="text-xs text-muted-foreground mt-1">(Calculated as 2x amount paid)</p>
                      </div>
                  ))}
              </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Cash, Gold & Other Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cash.map(c => (
                        <div key={c.id} className="p-4 bg-secondary rounded-lg space-y-2">
                           <p className="font-bold">Cash <span className="font-normal text-muted-foreground">- {c.location}</span></p>
                           <div className="space-y-1">
                             <label className="text-xs font-medium">Amount ({c.currency})</label>
                             <Input 
                                type="number" 
                                value={c.amount}
                                onChange={(e) => handleCashChange(c.id, e.target.value)}
                                className="h-8"
                              />
                           </div>
                        </div>
                    ))}
                    <div className="p-4 bg-secondary rounded-lg space-y-2">
                        <p className="font-bold">Gold Bars</p>
                         <div className="space-y-1">
                             <label className="text-xs font-medium">Grams</label>
                             <Input 
                                type="number" 
                                value={gold[0].grams}
                                onChange={(e) => handleGoldChange(e.target.value)}
                                className="h-8"
                              />
                           </div>
                    </div>
                    {otherAssets.map(o => (
                         <div key={o.id} className="p-4 bg-secondary rounded-lg space-y-2">
                            <p className="font-bold">{o.description}</p>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Value ({o.currency})</label>
                                <Input 
                                    type="number" 
                                    value={o.value}
                                    onChange={(e) => handleOtherAssetChange(o.id, e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
    </>
  )
}
