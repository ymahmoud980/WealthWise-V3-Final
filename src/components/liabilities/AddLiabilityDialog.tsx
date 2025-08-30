
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
import type { Loan } from "@/lib/types"


const loanSchema = z.object({
  lender: z.string().min(2, { message: "Lender name must be at least 2 characters." }),
  initial: z.coerce.number().min(1, { message: "Initial amount is required." }),
  remaining: z.coerce.number().min(1, { message: "Remaining amount is required." }),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
  monthlyPayment: z.coerce.number().min(1, { message: "Monthly payment is required." }),
  finalPayment: z.string().min(1, { message: "Final payment date is required." }),
})

interface AddLiabilityDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddLiability: (liability: Omit<Loan, "id">) => void
}

export function AddLiabilityDialog({ isOpen, onClose, onAddLiability }: AddLiabilityDialogProps) {
  const form = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      lender: "",
      initial: 0,
      remaining: 0,
      currency: "USD",
      monthlyPayment: 0,
      finalPayment: new Date().toISOString().split('T')[0],
    },
  })

  function onSubmit(values: z.infer<typeof loanSchema>) {
    onAddLiability(values)
    form.reset()
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
          <DialogDescription>
            Enter the details of your new loan below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gulf Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="initial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="remaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining</FormLabel>
                     <FormControl>
                      <Input type="number" placeholder="18000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="monthlyPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Payment</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="400" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EGP">EGP</SelectItem>
                        <SelectItem value="KWD">KWD</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="finalPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Loan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
