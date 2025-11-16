
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import type { Installment } from '@/lib/types';
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { addMonths, addYears, format, isValid, parse } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

export function UpcomingPayments() {
  const { data, setData } = useFinancialData();

  const getStatus = (dueDate: string) => {
      const today = new Date();
      const dateParts = dueDate.split('-').map(part => parseInt(part, 10));
      const due = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (!isValidDate(due)) {
        return { className: 'text-gray-500', text: 'Invalid date' };
      }

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-red-700 font-bold', text: `Overdue by ${-diffDays} days` };
      if (diffDays <= 30) return { className: 'text-amber-600', text: `${diffDays} days away` };
      return { className: 'text-gray-500', text: `Due in ${diffDays} days` };
  }

  const handleMarkAsPaid = (installmentId: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const installment = updatedData.liabilities.installments.find((i: Installment) => i.id === installmentId);

    if (installment) {
      installment.paid += installment.amount;
      
      if (installment.paid > installment.total) {
        installment.paid = installment.total;
      }
      
      const currentDueDate = parse(installment.nextDueDate, 'yyyy-MM-dd', new Date());
      let nextDate: Date;

      if (!isValid(currentDueDate)) {
        console.error("Invalid due date for installment:", installment.id);
        return; // Don't proceed if the date is invalid
      }

      if (installment.frequency === 'Quarterly') {
        nextDate = addMonths(currentDueDate, 3);
      } else if (installment.frequency === 'Semi-Annual') {
        nextDate = addMonths(currentDueDate, 6);
      } else if (installment.frequency === 'Annual') {
        nextDate = addYears(currentDueDate, 1);
      } else {
        nextDate = currentDueDate;
      }
      
      installment.nextDueDate = format(nextDate, 'yyyy-MM-dd');
      
      setData(updatedData);
    }
  };


  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

  const parseDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(0); // Return an epoch date if string is invalid
    const parts = dateString.split('-').map(Number);
    // Note: months are 0-indexed in JS Date
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  // Ensure data and installments exist before trying to sort
  const sortedPayments = (data?.liabilities?.installments || [])
    .filter(p => p.paid < p.total)
    .sort((a, b) => parseDate(a.nextDueDate).getTime() - parseDate(b.nextDueDate).getTime());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Installments</CardTitle>
          <CardDescription>Check the box to mark as paid.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {sortedPayments.length > 0 ? (
                sortedPayments.map((payment) => {
                  const status = getStatus(payment.nextDueDate);
                  const isChecked = false; // Checkbox is always initially unchecked
                  return (
                  <div key={payment.id} className="flex items-center gap-4">
                    <Checkbox
                        id={`payment-${payment.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                            if (checked) {
                            handleMarkAsPaid(payment.id);
                            }
                        }}
                    />
                    <div className={cn("flex-1 grid grid-cols-3 gap-2 items-center text-sm")}>
                      <div className="col-span-2">
                          <p className="font-medium truncate">{payment.project}</p>
                          <p className={cn("text-xs", status.className)}>{status.text}</p>
                      </div>
                      <span className="font-semibold text-right text-destructive">- {payment.amount.toLocaleString()} {payment.currency}</span>
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
  );
}
