// Force Chart Update.
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
  // We filter out 0 values so empty bars don't take up space
  const data = [
    { 
      name: "Existing Real Estate", 
      value: assetsBreakdown.existingRealEstate, 
      color: "#10b981", // Emerald 500
      gradient: "from-emerald-500 to-emerald-600"
    },
    { 
      name: "Off-Plan Real Estate", 
      value: assetsBreakdown.offPlanRealEstate, 
      color: "#34d399", // Emerald 400
      gradient: "from-emerald-400 to-teal-400"
    },
    { 
      name: "Gold", 
      value: assetsBreakdown.gold, 
      color: "#fbbf24", // Amber 400
      gradient: "from-amber-300 to-amber-500"
    },
    { 
      name: "Silver", 
      value: assetsBreakdown.silver, 
      color: "#94a3b8", // Slate 400
      gradient: "from-slate-300 to-slate-500"
    },
    { 
      name: "Cash", 
      value: assetsBreakdown.cash, 
      color: "#3b82f6", // Blue 500
      gradient: "from-blue-400 to-indigo-500"
    },
    { 
      name: "Other", 
      value: assetsBreakdown.other, 
      color: "#a855f7", // Purple 500
      gradient: "from-purple-400 to-fuchsia-500"
    },
  ].filter(item => item.value > 0); // Hide empty categories

  // Custom Tooltip to look like Glass
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(1) : "0";
      
      return (
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white mb-1">{item.name}</p>
          <p className="text-emerald-400 font-mono text-lg">{format(item.value)}</p>
          <p className="text-xs text-muted-foreground mt-1">{percentage}% of Total Net Worth</p>
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
          barSize={32} // Thicker bars
        >
          {/* Axis Styling */}
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={140}
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} // Light gray text
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          
          {/* Bars with Rounded Ends and Colors */}
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