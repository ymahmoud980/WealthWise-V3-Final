"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: any, type: string) => void;
}

export function AddAssetDialog({ isOpen, onClose, onAddAsset }: AddAssetDialogProps) {
  const [activeTab, setActiveTab] = useState("realEstate");
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    value: "", // Current Market Value
    cost: "",  // Base Purchase Price
    currency: "USD",
    
    // Rental Props
    monthlyRent: "",
    rentFrequency: "monthly",
    nextRentDate: "",

    // Under Development Extras
    maintenanceCost: "",
    parkingCost: "",
    maintenanceDate: "",
    paymentFrequency: "Quarterly", // For the linked liability
    
    // Metals/Cash
    grams: "",
    amount: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    let newAsset: any = {};

    if (activeTab === 'realEstate') {
       newAsset = {
         name: formData.name,
         location: formData.location,
         currentValue: parseFloat(formData.value) || 0,
         purchasePrice: parseFloat(formData.cost) || 0,
         currency: formData.currency,
         monthlyRent: parseFloat(formData.monthlyRent) || 0,
         rentFrequency: formData.rentFrequency,
         nextRentDueDate: formData.nextRentDate || new Date().toISOString().split('T')[0]
       };
    } 
    else if (activeTab === 'underDevelopment') {
       newAsset = {
         name: formData.name,
         location: formData.location,
         currentValue: parseFloat(formData.value) || 0,
         purchasePrice: parseFloat(formData.cost) || 0,
         currency: formData.currency,
         // New Fields
         maintenanceCost: parseFloat(formData.maintenanceCost) || 0,
         parkingCost: parseFloat(formData.parkingCost) || 0,
         maintenanceDueDate: formData.maintenanceDate,
         // We pass this extra field so the parent knows how to create the liability
         paymentFrequency: formData.paymentFrequency 
       };
    }
    else if (['gold', 'silver', 'cash', 'other'].includes(activeTab)) {
        // ... (Keep existing logic for others)
        if (activeTab === 'cash') {
            newAsset = { location: formData.name, amount: parseFloat(formData.amount) || 0, currency: formData.currency };
        } else if (activeTab === 'other') {
            newAsset = { description: formData.name, value: parseFloat(formData.value) || 0, currency: formData.currency };
        } else {
            newAsset = { location: formData.location, grams: parseFloat(formData.grams) || 0 };
        }
    }

    onAddAsset(newAsset, activeTab);
    
    // Reset
    setFormData({ name: "", location: "", value: "", cost: "", currency: "USD", monthlyRent: "", rentFrequency: "monthly", nextRentDate: "", maintenanceCost: "", parkingCost: "", maintenanceDate: "", paymentFrequency: "Quarterly", grams: "", amount: "" });
  };

  const inputClass = "bg-black/20 border-white/10 text-white";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>Select the asset type below.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="realEstate" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40">
            <TabsTrigger value="realEstate">Ready Property</TabsTrigger>
            <TabsTrigger value="underDevelopment">Off-Plan</TabsTrigger>
            <TabsTrigger value="other">Cash/Metal</TabsTrigger>
          </TabsList>

          {/* --- READY PROPERTY --- */}
          <TabsContent value="realEstate" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Property Name</Label><Input className={inputClass} placeholder="e.g. Gardenia Apt 1" value={formData.name} onChange={e => handleChange('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Location</Label><Input className={inputClass} placeholder="City/Building" value={formData.location} onChange={e => handleChange('location', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Current Market Value</Label><Input type="number" className={inputClass} value={formData.value} onChange={e => handleChange('value', e.target.value)} /></div>
                <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => handleChange('currency', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div className="space-y-2"><Label>Monthly Rent</Label><Input type="number" className={inputClass} value={formData.monthlyRent} onChange={e => handleChange('monthlyRent', e.target.value)} /></div>
                <div className="space-y-2"><Label>Next Rent Date</Label><Input type="date" className={inputClass} value={formData.nextRentDate} onChange={e => handleChange('nextRentDate', e.target.value)} /></div>
            </div>
          </TabsContent>

          {/* --- OFF PLAN (UPDATED) --- */}
          <TabsContent value="underDevelopment" className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Project Name</Label><Input className={inputClass} placeholder="e.g. Nile Admin" value={formData.name} onChange={e => handleChange('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Location</Label><Input className={inputClass} placeholder="Area" value={formData.location} onChange={e => handleChange('location', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2"><Label>Unit Base Price</Label><Input type="number" className={inputClass} value={formData.cost} onChange={e => handleChange('cost', e.target.value)} /></div>
                <div className="space-y-2"><Label>Current Market Value</Label><Input type="number" className={inputClass} value={formData.value} onChange={e => handleChange('value', e.target.value)} /></div>
                <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => handleChange('currency', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
            </div>
            
            {/* NEW FIELDS */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div className="space-y-2"><Label>Maintenance Cost</Label><Input type="number" className={inputClass} placeholder="0" value={formData.maintenanceCost} onChange={e => handleChange('maintenanceCost', e.target.value)} /></div>
                <div className="space-y-2"><Label>Parking Cost</Label><Input type="number" className={inputClass} placeholder="0" value={formData.parkingCost} onChange={e => handleChange('parkingCost', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Maint. Due Date</Label><Input type="date" className={inputClass} value={formData.maintenanceDate} onChange={e => handleChange('maintenanceDate', e.target.value)} /></div>
                <div className="space-y-2"><Label>Installment Freq.</Label><Select value={formData.paymentFrequency} onValueChange={v => handleChange('paymentFrequency', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Semi-Annual">Semi-Annual</SelectItem><SelectItem value="Annual">Annual</SelectItem></SelectContent></Select></div>
            </div>
          </TabsContent>

          {/* --- OTHER TABS (Simplified for brevity, logic exists in handleAdd) --- */}
          <TabsContent value="other" className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Type</Label><Select onValueChange={setActiveTab}><SelectTrigger className={inputClass}><SelectValue placeholder="Select Type" /></SelectTrigger><SelectContent><SelectItem value="gold">Gold</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="other">Other Asset</SelectItem></SelectContent></Select></div>
                 <div className="space-y-2"><Label>{activeTab === 'cash' || activeTab === 'other' ? 'Value/Amount' : 'Weight (Grams)'}</Label><Input type="number" className={inputClass} value={activeTab === 'cash' ? formData.amount : activeTab === 'other' ? formData.value : formData.grams} onChange={e => handleChange(activeTab === 'cash' ? 'amount' : activeTab === 'other' ? 'value' : 'grams', e.target.value)} /></div>
             </div>
             {(activeTab === 'cash' || activeTab === 'other') && (
                 <div className="space-y-2"><Label>Description/Bank</Label><Input className={inputClass} value={formData.name} onChange={e => handleChange('name', e.target.value)} /></div>
             )}
             {(activeTab === 'gold' || activeTab === 'silver') && (
                 <div className="space-y-2"><Label>Storage Location</Label><Input className={inputClass} value={formData.location} onChange={e => handleChange('location', e.target.value)} /></div>
             )}
          </TabsContent>

        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Add Asset</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}