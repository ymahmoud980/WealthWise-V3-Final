"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: any;
  icon: ReactNode;
  isCurrency?: boolean;
}

export function StatCard({ title, value, icon, isCurrency = false }: StatCardProps) {
  const { format } = useCurrency();
  const safeValue = Number(value);
  const displayValue = isNaN(safeValue) ? 0 : safeValue;
  const formattedText = isCurrency ? format(displayValue) : displayValue;

  const getColor = () => {
    if (title === 'Liabilities') return 'text-rose-400 drop-shadow-md';
    if (title.includes('Cash Flow')) return displayValue >= 0 ? 'text-emerald-400 drop-shadow-md' : 'text-rose-400 drop-shadow-md';
    if (title === 'Net Worth') return 'text-amber-400 drop-shadow-md';
    return 'text-foreground';
  };

  return (
    <div className="glass-panel p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group border border-white/10">
      <div className="absolute -right-4 -top-4 h-24 w-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity" />

      <div className="relative z-10">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
          <div className="p-2 bg-white/5 rounded-lg backdrop-blur-md border border-white/5 shadow-inner">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          {/* FIX: Changed text-3xl to text-xl/2xl and added truncation handling */}
          <div 
            className={cn("text-2xl font-bold tracking-tight font-mono truncate", getColor())}
            title={formattedText.toString()} // Hover to see full number
          >
            {formattedText}
          </div>
        </div>
      </div>
    </div>
  );
}