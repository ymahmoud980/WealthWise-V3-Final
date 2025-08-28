"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { upcomingPaymentsData } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UpcomingPayments() {
  const [payments, setPayments] = useState(upcomingPaymentsData.slice(0, 10));
  const { format } = useCurrency();

  const handleCheckChange = (id: string) => {
    // In a real app, this would trigger a database update.
    // For now, we'll just remove it from the list.
    setPayments(payments.filter(p => p.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>Next 10 installments and bills due.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center gap-4">
                  <Checkbox
                    id={`payment-${payment.id}`}
                    onCheckedChange={() => handleCheckChange(payment.id)}
                  />
                  <div className={cn("flex-1 grid grid-cols-3 gap-2 items-center text-sm")}>
                    <span className="font-medium truncate col-span-2">{payment.name}</span>
                    <span className="font-semibold text-right">{format(payment.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">All payments cleared!</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
