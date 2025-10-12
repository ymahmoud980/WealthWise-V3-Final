
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
import type { HouseholdExpense } from "@/lib/types"


const expenseSchema = z.object({
  description: z.string().min(2, "Description is required."),
  amount: z.coerce.number().min(1, "Amount must be a positive number."),
  currency: z.enum(["EGP", "USD", "KWD", "TRY"]),
})

interface AddExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (expense: Omit<HouseholdExpense, "id">) => void
}

export function AddExpenseDialog({ isOpen, onClose, onAddExpense }: AddExpenseDialogProps) {
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      currency: "EGP",
    },
  })

  function onSubmit(values: z.infer<typeof expenseSchema>) {
    onAddExpense(values)
    form.reset()
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Household Expense</DialogTitle>
          <DialogDescription>
            Enter the details for a recurring monthly household expense.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries, Utilities" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
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
                                <SelectValue />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

