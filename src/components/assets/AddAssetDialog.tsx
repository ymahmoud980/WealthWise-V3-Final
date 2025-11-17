

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { RealEstateAsset, CashAsset, GoldAsset, OtherAsset, UnderDevelopmentAsset, SilverAsset } from "@/lib/types"

type AssetType = "realEstate" | "underDevelopment" | "cash" | "gold" | "silver" | "other"

const realEstateSchema = z.object({
  name: z.string().min(2, "Name is required."),
  location: z.string().min(2, "Location is required."),
  currentValue: z.coerce.number().min(1),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
  monthlyRent: z.coerce.number().min(0),
  rentCurrency: z.enum(["EGP", "USD", "KWD", "TRY"]).optional(),
});

const underDevelopmentSchema = z.object({
  name: z.string().min(2, "Name is required."),
  location: z.string().min(2, "Location is required."),
  purchasePrice: z.coerce.number().min(1),
  currentValue: z.coerce.number().min(1),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
  linkedInstallmentId: z.string().optional(), // This could be linked later
});

const cashSchema = z.object({
  location: z.enum(['Egypt', 'Kuwait', 'Turkey', 'Other']),
  amount: z.coerce.number().min(1),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
});

const goldSchema = z.object({
  location: z.enum(['Egypt', 'Kuwait', 'Turkey', 'Other']),
  grams: z.coerce.number().min(1),
});

const silverSchema = z.object({
  location: z.enum(['Egypt', 'Kuwait', 'Turkey', 'Other']),
  grams: z.coerce.number().min(1),
});

const otherSchema = z.object({
  description: z.string().min(2, "Description is required."),
  value: z.coerce.number().min(1),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
});

const formSchema = z.object({
  assetType: z.enum(["realEstate", "underDevelopment", "cash", "gold", "silver", "other"]),
  realEstate: realEstateSchema.optional(),
  underDevelopment: underDevelopmentSchema.optional(),
  cash: cashSchema.optional(),
  gold: goldSchema.optional(),
  silver: silverSchema.optional(),
  other: otherSchema.optional(),
}).refine(data => {
    switch (data.assetType) {
        case 'realEstate': return !!data.realEstate;
        case 'underDevelopment': return !!data.underDevelopment;
        case 'cash': return !!data.cash;
        case 'gold': return !!data.gold;
        case 'silver': return !!data.silver;
        case 'other': return !!data.other;
        default: return false;
    }
}, {
    message: "Please fill out the details for the selected asset type.",
    path: ["assetType"],
});


interface AddAssetDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddAsset: (asset: any, type: AssetType) => void
}

export function AddAssetDialog({ isOpen, onClose, onAddAsset }: AddAssetDialogProps) {
  const [assetType, setAssetType] = useState<AssetType>("realEstate");

  const form = useForm({
    defaultValues: {
      assetType: "realEstate",
      realEstate: { name: "", location: "", currentValue: 0, currency: "USD", monthlyRent: 0 },
      underDevelopment: { name: "", location: "", purchasePrice: 0, currentValue: 0, currency: "USD" },
      cash: { location: 'Egypt', amount: 0, currency: "USD" },
      gold: { location: 'Egypt', grams: 0 },
      silver: { location: 'Egypt', grams: 0 },
      other: { description: "", value: 0, currency: "USD" },
    },
  })

  function onSubmit(values: any) {
    const finalValues = {
        ...values[assetType],
    }
    if (assetType === 'realEstate') {
        finalValues.rentDueDay = 1;
        finalValues.rentFrequency = 'monthly';
        finalValues.nextRentDueDate = new Date().toISOString().split('T')[0];
    }
     if (assetType === 'underDevelopment') {
        finalValues.linkedInstallmentId = `inst-${new Date().getTime()}`; // Placeholder
    }
    onAddAsset(finalValues, assetType)
    form.reset()
    onClose();
  }

  const handleTypeChange = (type: AssetType) => {
    setAssetType(type);
    form.setValue("assetType", type);
  }

  const locationOptions = [
    { value: "Egypt", label: "Egypt" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Turkey", label: "Turkey" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Select the type of asset you want to add and fill in the details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Asset Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => handleTypeChange(value as AssetType)}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="realEstate" />
                        </FormControl>
                        <FormLabel className="font-normal">Real Estate</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="underDevelopment" />
                        </FormControl>
                        <FormLabel className="font-normal">Under Dev.</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal">Cash</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="gold" />
                        </FormControl>
                        <FormLabel className="font-normal">Gold</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="silver" />
                        </FormControl>
                        <FormLabel className="font-normal">Silver</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {assetType === 'realEstate' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormField control={form.control} name="realEstate.name" render={({ field }) => ( <FormItem><FormLabel>Property Name</FormLabel><FormControl><Input placeholder="e.g., Downtown Apartment" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="realEstate.location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., New Cairo, Egypt" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="realEstate.currentValue" render={({ field }) => ( <FormItem><FormLabel>Market Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="realEstate.currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="realEstate.monthlyRent" render={({ field }) => ( <FormItem><FormLabel>Monthly Rent</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="realEstate.rentCurrency" render={({ field }) => ( <FormItem><FormLabel>Rent Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormDescription className="text-xs">Optional.</FormDescription><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}
            {assetType === 'underDevelopment' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormField control={form.control} name="underDevelopment.name" render={({ field }) => ( <FormItem><FormLabel>Property Name</FormLabel><FormControl><Input placeholder="e.g., Downtown Apartment" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="underDevelopment.location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., New Cairo, Egypt" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="underDevelopment.purchasePrice" render={({ field }) => ( <FormItem><FormLabel>Purchase Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="underDevelopment.currentValue" render={({ field }) => ( <FormItem><FormLabel>Current Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <FormField control={form.control} name="underDevelopment.currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
            )}
             {assetType === 'cash' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormField control={form.control} name="cash.location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{locationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="cash.amount" render={({ field }) => ( <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="cash.currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}
            {assetType === 'gold' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormField control={form.control} name="gold.location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{locationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="gold.grams" render={({ field }) => ( <FormItem><FormLabel>Grams</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            )}
            {assetType === 'silver' && (
                <div className="space-y-4 p-4 border rounded-md">
                     <FormField control={form.control} name="silver.location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{locationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="silver.grams" render={({ field }) => ( <FormItem><FormLabel>Grams</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            )}
            {assetType === 'other' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <FormField control={form.control} name="other.description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Company Stock" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="other.value" render={({ field }) => ( <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="other.currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                </div>
            )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Asset</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
