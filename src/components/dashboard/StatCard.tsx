"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import CountUp from 'react-countup';

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
          <div
            className={cn(
              "font-bold tracking-tight font-mono transition-all duration-300",
              formattedText.toString().length > 15 ? "text-base" :
                formattedText.toString().length > 12 ? "text-lg" :
                  formattedText.toString().length > 9 ? "text-xl" : "text-2xl",
              getColor()
            )}
            title={formattedText.toString()}
          >
            {isCurrency && typeof displayValue === 'number' ? (
              <CountUp
                start={0}
                end={displayValue}
                duration={2.5}
                separator=","
                // We use formatting extracted substrings so KWD 1,000 matches the visual style
                prefix={formattedText.toString().split(/[0-9]/)[0] || ""}
                suffix={formattedText.toString().match(/[0-9]+(.+)/)?.[1]?.replace(/^[.,0-9]+/, "") || ""}
              />
            ) : (
              <CountUp start={0} end={displayValue} duration={2.5} decimals={1} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}