"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import type { Installment } from '@/lib/types';
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { addMonths, addYears, format, isValid, parse } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { CreditCard, CalendarClock } from "lucide-react"; // New Icons

export function UpcomingPayments() {
  const { data, setData } = useFinancialData();

  const getStatus = (dueDate: string) => {
      const today = new Date();
      const dateParts = dueDate.split('-').map(part => parseInt(part, 10));
      const due = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (!isValidDate(due)) {
        return { className: 'text-muted-foreground', text: 'Invalid date' };
      }

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded', text: `Overdue (${-diffDays}d)` };
      if (diffDays <= 30) return { className: 'text-amber-500 font-medium', text: `${diffDays} days left` };
      return { className: 'text-muted-foreground', text: `In ${diffDays} days` };
  }

  const handleMarkAsPaid = (installmentId: string) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const installment = updatedData.liabilities.installments.find((i: Installment) => i.id === installmentId);

    if (installment) {
      installment.paid += installment.amount;
      if (installment.paid > installment.total) installment.paid = installment.total;
      
      const currentDueDate = parse(installment.nextDueDate, 'yyyy-MM-dd', new Date());
      let nextDate: Date;

      if (!isValid(currentDueDate)) return;

      if (installment.frequency === 'Quarterly') nextDate = addMonths(currentDueDate, 3);
      else if (installment.frequency === 'Semi-Annual') nextDate = addMonths(currentDueDate, 6);
      else if (installment.frequency === 'Annual') nextDate = addYears(currentDueDate, 1);
      else nextDate = currentDueDate;
      
      installment.nextDueDate = format(nextDate, 'yyyy-MM-dd');
      setData(updatedData);
    }
  };

  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

  const parseDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(0);
    const parts = dateString.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  const sortedPayments = (data?.liabilities?.installments || [])
    .filter(p => p.paid < p.total)
    .sort((a, b) => parseDate(a.nextDueDate).getTime() - parseDate(b.nextDueDate).getTime());

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-rose-500" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Payables</h3>
                <p className="text-xs text-muted-foreground">Mark items as paid</p>
            </div>
        </div>
      </div>
      
      <div className="p-4">
          <ScrollArea className="h-[240px] pr-4">
            <div className="space-y-3">
              {sortedPayments.length > 0 ? (
                sortedPayments.map((payment) => {
                  const status = getStatus(payment.nextDueDate);
                  return (
                  <div key={payment.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                    <Checkbox
                        id={`payment-${payment.id}`}
                        checked={false}
                        onCheckedChange={(checked) => { if (checked) handleMarkAsPaid(payment.id); }}
                        className="data-[state=checked]:bg-rose-500 border-white/20"
                    />
                    <div className={cn("flex-1 grid grid-cols-3 gap-2 items-center text-sm")}>
                      <div className="col-span-2">
                          <p className="font-medium truncate text-foreground group-hover:text-rose-200 transition-colors">{payment.project}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <CalendarClock className="h-3 w-3 text-muted-foreground" />
                            <p className={cn("text-xs", status.className)}>{status.text}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="font-mono font-semibold text-rose-400 block">
                            -{payment.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">{payment.currency}</span>
                      </div>
                    </div>
                  </div>
                )})
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <p>No pending payments.</p>
                </div>
              )}
            </div>
          </ScrollArea>
      </div>
    </div>
  );
}