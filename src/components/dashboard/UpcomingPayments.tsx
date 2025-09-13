
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Installment } from '@/lib/types';
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinancialData } from "@/contexts/FinancialDataContext";

interface UpcomingPaymentsProps {
    payments: Installment[];
}

export function UpcomingPayments({ payments: initialPayments }: UpcomingPaymentsProps) {
  const { data, setData } = useFinancialData();
  const [paymentToMark, setPaymentToMark] = useState<Installment | null>(null);
  
  const getStatus = (dueDate: string) => {
      const today = new Date();
      const due = new Date(dueDate);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-red-700', text: `Overdue by ${-diffDays} days` };
      if (diffDays <= 30) return { className: 'text-amber-600', text: `${diffDays} days away` };
      if (diffDays <= 90) return { className: 'text-yellow-600', text: `${diffDays} days away` };
      return { className: 'text-gray-500', text: `${diffDays} days away` };
  }

  const handleMarkAsPaid = () => {
    if (!paymentToMark) return;

    const updatedData = { ...data };
    const installment = updatedData.liabilities.installments.find(p => p.id === paymentToMark.id);

    if (installment) {
      installment.paid += installment.amount;
      // You might want to update nextDueDate here as well, e.g., by adding the frequency interval.
      // For now, we'll just update the paid amount.
      setData(updatedData);
    }
    setPaymentToMark(null);
  };
  
  const sortedPayments = [...initialPayments].sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Installments</CardTitle>
          <CardDescription>Next project installments due. Check to mark as paid.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {sortedPayments.length > 0 ? (
                sortedPayments.map((payment) => {
                  const status = getStatus(payment.nextDueDate);
                  return (
                  <div key={payment.id} className="flex items-center gap-4">
                    <Checkbox
                      id={`payment-${payment.id}`}
                      onCheckedChange={() => setPaymentToMark(payment)}
                      disabled={payment.paid >= payment.total}
                    />
                    <div className={cn("flex-1 grid grid-cols-3 gap-2 items-center text-sm")}>
                      <div className="col-span-2">
                          <p className="font-medium truncate">{payment.project}</p>
                          <p className={cn("text-xs", status.className)}>{status.text}</p>
                      </div>
                      <span className="font-semibold text-right">{payment.amount.toLocaleString()} {payment.currency}</span>
                    </div>
                  </div>
                )})
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">All payments cleared!</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <AlertDialog open={!!paymentToMark} onOpenChange={() => setPaymentToMark(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the installment for **{paymentToMark?.project}** of **{paymentToMark?.amount.toLocaleString()} {paymentToMark?.currency}** as paid? This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
