
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import type { Installment } from "@/lib/types"


const installmentSchema = z.object({
  project: z.string().min(2, "Project name is required."),
  developer: z.string().min(2, "Developer name is required."),
  total: z.coerce.number().min(1),
  paid: z.coerce.number().min(0),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
  nextDueDate: z.string().min(1, "Next due date is required."),
  amount: z.coerce.number().min(1),
  frequency: z.enum(["Quarterly", "Semi-Annual", "Annual"]),
})

interface AddInstallmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddInstallment: (installment: Omit<Installment, "id">) => void
}

export function AddInstallmentDialog({ isOpen, onClose, onAddInstallment }: AddInstallmentDialogProps) {
  const form = useForm<z.infer<typeof installmentSchema>>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      project: "",
      developer: "",
      total: 0,
      paid: 0,
      currency: "EGP",
      nextDueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      frequency: "Quarterly",
    },
  })

  function onSubmit(values: z.infer<typeof installmentSchema>) {
    onAddInstallment(values)
    form.reset()
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Project Installment</DialogTitle>
          <DialogDescription>
            Enter the details of the new project installment plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="project" render={({ field }) => (<FormItem><FormLabel>Project Name</FormLabel><FormControl><Input placeholder="e.g., Dejoya" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="developer" render={({ field }) => (<FormItem><FormLabel>Developer</FormLabel><FormControl><Input placeholder="e.g., Taj Misr" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="total" render={({ field }) => (<FormItem><FormLabel>Total Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="paid" render={({ field }) => (<FormItem><FormLabel>Amount Paid</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Installment Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currency" render={({ field }) => ( <FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="KWD">KWD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="nextDueDate" render={({ field }) => (<FormItem><FormLabel>Next Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Semi-Annual">Semi-Annual</SelectItem><SelectItem value="Annual">Annual</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Installment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
