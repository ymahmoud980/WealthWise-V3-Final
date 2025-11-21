"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RealEstateAsset } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, addMonths, isValid, parse } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Building2, ArrowDownLeft } from "lucide-react"; // New Icons

interface UpcomingRentsProps {
    rents: RealEstateAsset[];
}

export function UpcomingRents({ rents: initialRents }: UpcomingRentsProps) {
  const { data, setData } = useFinancialData();

  const getStatus = (dueDate: string) => {
      const today = new Date();
      const dateParts = dueDate.split('-').map(part => parseInt(part, 10));
      const due = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (!isValid(due)) return { className: 'text-muted-foreground', text: 'Invalid date' };

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-rose-500 font-bold', text: `Overdue (${-diffDays}d)` };
      if (diffDays <= 7) return { className: 'text-emerald-500 font-medium', text: `Due soon (${diffDays}d)` };
      return { className: 'text-muted-foreground', text: `${diffDays} days away` };
  }

  const handleMarkAsReceived = (rentToReceive: RealEstateAsset) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const rentAsset = updatedData.assets.realEstate.find((r: RealEstateAsset) => r.id === rentToReceive.id);

    if (rentAsset) {
      const currentDueDate = parse(rentAsset.nextRentDueDate, 'yyyy-MM-dd', new Date());
      let nextDate: Date;
      
      if (!isValid(currentDueDate)) return;
      
      if (rentAsset.rentFrequency === 'monthly') nextDate = addMonths(currentDueDate, 1);
      else if (rentAsset.rentFrequency === 'semi-annual') nextDate = addMonths(currentDueDate, 6);
      else nextDate = currentDueDate;

      rentAsset.nextRentDueDate = format(nextDate, 'yyyy-MM-dd');
      setData(updatedData);
    }
  };

  const parseDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(0);
    const parts = dateString.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  const sortedRents = [...(initialRents || [])]
    .filter(r => r.monthlyRent > 0)
    .sort((a,b) => parseDate(a.nextRentDueDate).getTime() - parseDate(b.nextRentDueDate).getTime());

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground">Receivables</h3>
                <p className="text-xs text-muted-foreground">Collect rents</p>
            </div>
        </div>
      </div>

      <div className="p-4">
          <ScrollArea className="h-[240px] pr-4">
            <div className="space-y-3">
              {sortedRents.length > 0 ? (
                sortedRents.map((rent) => {
                    const status = getStatus(rent.nextRentDueDate);
                    const formattedDate = isValid(parseDate(rent.nextRentDueDate)) ? format(parseDate(rent.nextRentDueDate), 'MMM dd') : "--";
                    return (
                      <div key={rent.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                        <Checkbox
                          id={`rent-${rent.id}`}
                          onCheckedChange={(checked) => { if(checked) handleMarkAsReceived(rent); }}
                          checked={false}
                          className="data-[state=checked]:bg-emerald-500 border-white/20"
                        />
                        <div className="flex-1 grid grid-cols-3 gap-2 items-center text-sm">
                          <div className='col-span-2'>
                              <p className="font-medium truncate text-foreground group-hover:text-emerald-200 transition-colors">{rent.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <ArrowDownLeft className="h-3 w-3 text-emerald-500/50" />
                                <p className="text-xs text-muted-foreground">{formattedDate} • <span className={status.className}>{status.text}</span></p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="font-mono font-semibold text-emerald-400 block">
                                  +{rent.monthlyRent.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase">{rent.rentCurrency || rent.currency}</span>
                          </div>
                        </div>
                      </div>
                    )
                })
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <p>No upcoming rents.</p>
                  </div>
              )}
            </div>
          </ScrollArea>
      </div>
    </div>
  );
}