
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import type { Installment } from '@/lib/types';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { addMonths, addYears, format, isValid, parse } from "date-fns";

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
      // Increment paid amount
      installment.paid += installment.amount;
      
      // Ensure paid amount does not exceed total
      if (installment.paid > installment.total) {
        installment.paid = installment.total;
      }
      
      // Calculate and format the next due date
      const currentDueDate = parse(installment.nextDueDate, 'yyyy-MM-dd', new Date());
      let nextDate: Date;

      if (installment.frequency === 'Quarterly') {
        nextDate = addMonths(currentDueDate, 3);
      } else if (installment.frequency === 'Semi-Annual') {
        nextDate = addMonths(currentDueDate, 6);
      } else if (installment.frequency === 'Annual') {
        nextDate = addYears(currentDueDate, 1);
      } else {
        nextDate = currentDueDate; // Should not happen
      }
      
      installment.nextDueDate = format(nextDate, 'yyyy-MM-dd');
      
      setData(updatedData);
    }
  };


  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

  const parseDate = (dateString: string) => {
    const parts = dateString.split('-').map(Number);
    // Note: months are 0-indexed in JS Date
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  const sortedPayments = [...initialPayments]
    .filter(p => p.paid < p.total) // Only show active installments
    .sort((a, b) => parseDate(a.nextDueDate).getTime() - parseDate(b.nextDueDate).getTime());

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Installments</CardTitle>
            <CardDescription>A summary of your next project installments due.</CardDescription>
          </div>
           <Button asChild variant="outline" size="sm">
                <Link href="/liabilities">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
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
                      <span className="font-semibold text-right">{payment.amount.toLocaleString()} {payment.currency}</span>
                    </div>
                  </div>
                )})
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">All payments cleared!</p>
              )}
            </div>
        </CardContent>
      </Card>
    </>
  );
}

    