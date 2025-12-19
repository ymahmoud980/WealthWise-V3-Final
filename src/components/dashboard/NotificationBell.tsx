"use client";

import { useState } from "react";
import { Bell, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { differenceInDays, parse, isValid } from "date-fns";

export function NotificationBell() {
  const { data } = useFinancialData();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Gather all events (Rents + Installments)
  const today = new Date();
  const alerts: { title: string; days: number; type: 'warning' | 'success'; amount: number; currency: string }[] = [];

  // Check Rents (Income)
  data.assets.realEstate.forEach(asset => {
    if (asset.nextRentDueDate) {
      const dueDate = parse(asset.nextRentDueDate, 'yyyy-MM-dd', new Date());
      if (isValid(dueDate)) {
        const diff = differenceInDays(dueDate, today);
        if (diff <= 10 && diff >= -30) { // Show if due in 10 days or overdue
           alerts.push({
             title: `Rent: ${asset.name}`,
             days: diff,
             type: 'success', // Green because it's money coming in
             amount: asset.monthlyRent,
             currency: asset.rentCurrency || asset.currency
           });
        }
      }
    }
  });

  // Check Installments (Expenses)
  data.liabilities.installments.forEach(inst => {
    if (inst.nextDueDate && inst.paid < inst.total) {
      const dueDate = parse(inst.nextDueDate, 'yyyy-MM-dd', new Date());
      if (isValid(dueDate)) {
        const diff = differenceInDays(dueDate, today);
        if (diff <= 30 && diff >= -30) { // Show if due in 30 days (Installments need more warning)
           alerts.push({
             title: `Pay: ${inst.project}`,
             days: diff,
             type: 'warning', // Red/Orange because it's expense
             amount: inst.amount,
             currency: inst.currency
           });
        }
      }
    }
  });

  // Sort by urgency
  alerts.sort((a, b) => a.days - b.days);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-[#0f172a]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-[#1e293b] border-white/10 text-white shadow-2xl" align="end">
        <div className="p-4 border-b border-white/10">
          <h4 className="font-semibold text-sm">Notifications ({alerts.length})</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No upcoming payments.</p>
          ) : (
            alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`mt-0.5 p-1 rounded-full ${alert.type === 'warning' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {alert.type === 'warning' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.title}</p>
                    <div className="flex justify-between items-center">
                        <p className={`text-xs ${alert.days < 0 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            {alert.days < 0 ? `Overdue ${Math.abs(alert.days)}d` : `Due in ${alert.days} days`}
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-200">
                            {alert.amount.toLocaleString()} {alert.currency}
                        </p>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}