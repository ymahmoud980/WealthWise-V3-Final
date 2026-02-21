"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { useCurrency } from "@/hooks/use-currency";

interface AssetAllocationChartProps {
  assetsBreakdown?: any;
  totalAssets?: number;
  rawAssets?: any; // Pass the entire assets object to the chart so the tooltip can access the raw 'otherAssets' array
}

export function AssetAllocationChart({ assetsBreakdown, totalAssets = 0, rawAssets }: AssetAllocationChartProps) {
  const { format } = useCurrency();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Chart...</div>;
  if (!assetsBreakdown || totalAssets === 0) return <div className="h-[350px] flex items-center justify-center text-muted-foreground">No data available</div>;

  const data = [
    { name: "Existing Real Estate", value: Number(assetsBreakdown?.existingRealEstate) || 0, color: "#10b981", gradient: "url(#colorGreen)" },
    { name: "Off-Plan Real Estate", value: Number(assetsBreakdown?.offPlanRealEstate) || 0, color: "#34d399", gradient: "url(#colorLightGreen)" },
    { name: "Cash", value: Number(assetsBreakdown?.cash) || 0, color: "#3b82f6", gradient: "url(#colorBlue)" },
    { name: "Gold", value: Number(assetsBreakdown?.gold) || 0, color: "#fbbf24", gradient: "url(#colorGold)" },
    { name: "Silver", value: Number(assetsBreakdown?.silver) || 0, color: "#94a3b8", gradient: "url(#colorSilver)" },
    { name: "Other", value: Number(assetsBreakdown?.other) || 0, color: "#8b5cf6", gradient: "url(#colorPurple)" },
  ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  if (data.length === 0) return <div className="h-[350px] flex items-center justify-center text-muted-foreground">Add assets to see allocation</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const safeTotal = Number(totalAssets) || 1;
      const percentage = ((item.value / safeTotal) * 100).toFixed(1);

      // Determine if this is the "Other" slice and we have raw records to show
      const isOtherSlice = item.name === "Other";
      const otherRecords = rawAssets?.otherAssets || [];

      return (
        <div className="bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <p className="font-bold text-white text-sm">{item.name}</p>
          </div>
          <p className="text-xl font-mono text-white tracking-tight mb-1">{format(item.value)}</p>
          <div className="bg-white/5 rounded px-2 py-1 inline-block mb-2">
            <p className="text-xs font-medium text-emerald-400">{percentage}% of Portfolio</p>
          </div>

          {/* Detailed Breakdown for "Other" Category */}
          {isOtherSlice && otherRecords.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <p className="text-xs text-muted-foreground mb-1">Composition:</p>
              {otherRecords.map((record: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs text-slate-300 font-mono">
                  <span className="truncate max-w-[120px]">{record.type}</span>
                  <span>{format(record.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[350px] w-full mt-4 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
            <linearGradient id="colorLightGreen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
            <linearGradient id="colorGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#d97706" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
            <linearGradient id="colorSilver" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#64748b" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient>
            <linearGradient id="colorPurple" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.gradient} className="hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}