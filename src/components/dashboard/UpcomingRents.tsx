"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { upcomingRentsData } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UpcomingRents() {
  const [rents, setRents] = useState(upcomingRentsData.slice(0, 10));
  const { format } = useCurrency();

  const handleCheckChange = (id: string) => {
    // In a real app, this would trigger a database update.
    // For now, we'll just remove it from the list.
    setRents(rents.filter(r => r.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Rents</CardTitle>
        <CardDescription>Next 10 rental payments to be received.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {rents.length > 0 ? (
              rents.map((rent) => (
                <div key={rent.id} className="flex items-center gap-4">
                  <Checkbox
                    id={`rent-${rent.id}`}
                    onCheckedChange={() => handleCheckChange(rent.id)}
                  />
                  <div className="flex-1 grid grid-cols-3 gap-2 items-center text-sm">
                    <span className="font-medium truncate col-span-2">{rent.property}</span>
                    <span className="font-semibold text-right text-green-600">{format(rent.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming rents.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
