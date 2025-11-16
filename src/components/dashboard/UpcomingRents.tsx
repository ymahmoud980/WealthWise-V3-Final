
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RealEstateAsset } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, addMonths, isValid, parse } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { useFinancialData } from "@/contexts/FinancialDataContext";

interface UpcomingRentsProps {
    rents: RealEstateAsset[];
}

export function UpcomingRents({ rents: initialRents }: UpcomingRentsProps) {
  const { data, setData } = useFinancialData();

  const getStatus = (dueDate: string) => {
      const today = new Date();
      // Handle non-standard date formats
      const dateParts = dueDate.split('-').map(part => parseInt(part, 10));
      const due = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (!isValid(due)) {
          return { className: 'text-gray-500', text: 'Invalid date' };
      }

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { className: 'text-red-700', text: `Overdue by ${-diffDays} days` };
      if (diffDays <= 7) return { className: 'text-amber-600', text: `Due in ${diffDays} days` };
      return { className: 'text-gray-500', text: `Due in ${diffDays} days` };
  }

  const handleMarkAsReceived = (rentToReceive: RealEstateAsset) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const rentAsset = updatedData.assets.realEstate.find((r: RealEstateAsset) => r.id === rentToReceive.id);

    if (rentAsset) {
      const currentDueDate = parse(rentAsset.nextRentDueDate, 'yyyy-MM-dd', new Date());
      let nextDate: Date;
      
      if (!isValid(currentDueDate)) {
        console.error("Invalid due date for rent asset:", rentAsset.id);
        return; // Don't proceed if the date is invalid
      }
      
      if (rentAsset.rentFrequency === 'monthly') {
        nextDate = addMonths(currentDueDate, 1);
      } else if (rentAsset.rentFrequency === 'semi-annual') {
        nextDate = addMonths(currentDueDate, 6);
      } else {
        nextDate = currentDueDate;
      }

      rentAsset.nextRentDueDate = format(nextDate, 'yyyy-MM-dd');
      setData(updatedData);
    }
  };

  const parseDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(0); // Return an epoch date if string is invalid
    const parts = dateString.split('-').map(Number);
    // Note: months are 0-indexed in JS Date
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  const sortedRents = [...(initialRents || [])]
    .filter(r => r.monthlyRent > 0)
    .sort((a,b) => parseDate(a.nextRentDueDate).getTime() - parseDate(b.nextRentDueDate).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rents</CardTitle>
          <CardDescription>Check the box to mark as received.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {sortedRents.length > 0 ? (
                sortedRents.map((rent) => {
                    const status = getStatus(rent.nextRentDueDate);
                    const formattedDate = isValid(parseDate(rent.nextRentDueDate)) ? format(parseDate(rent.nextRentDueDate), 'MMM dd, yyyy') : "Invalid Date";
                    return (
                      <div key={rent.id} className="flex items-center gap-4">
                        <Checkbox
                          id={`rent-${rent.id}`}
                          onCheckedChange={(checked) => {
                             if(checked) {
                                handleMarkAsReceived(rent);
                             }
                          }}
                           checked={false} // Always start unchecked
                        />
                        <div className="flex-1 grid grid-cols-3 gap-2 items-center text-sm">
                          <div className='col-span-2'>
                              <p className="font-medium truncate">{rent.name}</p>
                              <p className="text-xs text-muted-foreground">{formattedDate}</p>
                              <p className={cn("text-xs", status.className)}>{status.text}</p>
                          </div>
                          <span className="font-semibold text-right text-green-600">
                              + {rent.monthlyRent.toLocaleString()} {rent.rentCurrency || rent.currency}
                          </span>
                        </div>
                      </div>
                    )
                })
              ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No upcoming rents.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
