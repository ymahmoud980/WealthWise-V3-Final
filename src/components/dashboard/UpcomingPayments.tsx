
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Installment } from '@/lib/types';
import { Checkbox } from "@/components/ui/checkbox";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { addMonths, addYears, format } from "date-fns";

interface UpcomingPaymentsProps {
    payments: Installment[];
}

export function UpcomingPayments({ payments: initialPayments }: UpcomingPaymentsProps) {
  const { data, setData } = useFinancialData();
  
  const getStatus = (dueDate: string) => {
      const today = new Date();
      // Handle non-standard date formats
      const dateParts = dueDate.split('-').map(part => parseInt(part, 10));
      const due = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-red-700', text: `Overdue by ${-diffDays} days` };
      if (diffDays <= 30) return { className: 'text-amber-600', text: `${diffDays} days away` };
      if (diffDays <= 90) return { className: 'text-yellow-600', text: `${diffDays} days away` };
      return { className: 'text-gray-500', text: `${diffDays} days away` };
  }

  const handleMarkAsPaid = (paymentToMark: Installment) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const installment = updatedData.liabilities.installments.find((p: Installment) => p.id === paymentToMark.id);

    if (installment) {
      installment.paid += installment.amount;
      
      let nextDate = new Date(installment.nextDueDate.split('-').map((p:string) => parseInt(p, 10))[0], installment.nextDueDate.split('-').map((p:string) => parseInt(p, 10))[1]-1, installment.nextDueDate.split('-').map((p:string) => parseInt(p, 10))[2]);
      if (installment.frequency === 'Quarterly') {
        nextDate = addMonths(nextDate, 3);
      } else if (installment.frequency === 'Semi-Annual') {
        nextDate = addMonths(nextDate, 6);
      } else if (installment.frequency === 'Annual') {
        nextDate = addYears(nextDate, 1);
      }
      installment.nextDueDate = format(nextDate, 'yyyy-MM-dd');
      
      setData(updatedData);
    }
  };
  
  const sortedPayments = [...initialPayments].sort((a, b) => {
    const dateA = a.nextDueDate.split('-').map(Number);
    const dateB = b.nextDueDate.split('-').map(Number);
    return new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime() - new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime();
  });

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
                  const isPaid = payment.paid >= payment.total;
                  return (
                  <div key={payment.id} className="flex items-center gap-4">
                    <Checkbox
                      id={`payment-${payment.id}`}
                      onCheckedChange={(checked) => {
                        if (checked) {
                            handleMarkAsPaid(payment);
                        }
                      }}
                      checked={false} // Always start unchecked
                      disabled={isPaid}
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
    </>
  );
}
