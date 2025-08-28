"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  const { format } = useCurrency();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{format(value)}</div>
      </CardContent>
    </Card>
  );
}
