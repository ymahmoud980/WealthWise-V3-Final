"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useCurrency } from "@/hooks/use-currency";

interface AssetAllocationChartProps {
  assetsBreakdown: {
    existingRealEstate: number;
    offPlanRealEstate: number;
    cash: number;
    gold: number;
    silver: number;
    other: number;
  };
  totalAssets: number;
}

export function AssetAllocationChart({ assetsBreakdown, totalAssets }: AssetAllocationChartProps) {
  const { format } = useCurrency();

  // 1. Prepare Data with Explicit Vibrant Colors
  const data = [
    { 
      name: "Existing Real Estate", 
      value: assetsBreakdown.existingRealEstate, 
      color: "#10b981", // Emerald
    },
    { 
      name: "Off-Plan Real Estate", 
      value: assetsBreakdown.offPlanRealEstate, 
      color: "#34d399", // Teal
    },
    { 
      name: "Gold", 
      value: assetsBreakdown.gold, 
      color: "#fbbf24", // Amber
    },
    { 
      name: "Silver", 
      value: assetsBreakdown.silver, 
      color: "#94a3b8", // Slate
    },
    { 
      name: "Cash", 
      value: assetsBreakdown.cash, 
      color: "#3b82f6", // Blue
    },
    { 
      name: "Other", 
      value: assetsBreakdown.other, 
      color: "#a855f7", // Purple
    },
  ].filter(item => item.value > 0); 

  // Custom Glass Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(1) : "0";
      
      return (
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white mb-1">{item.name}</p>
          <p className="text-emerald-400 font-mono text-lg">{format(item.value)}</p>
          <p className="text-xs text-muted-foreground mt-1">{percentage}% of Net Worth</p>
        </div>
      );
    }
    return null;
  };

  if (totalAssets === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No asset data available yet.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
          barSize={32}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={140}
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}