

"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { useCurrency } from "@/hooks/use-currency";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--ring))"];

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
  
  const data = [
      { name: "Existing Real Estate", value: assetsBreakdown.existingRealEstate },
      { name: "Off-Plan Real Estate", value: assetsBreakdown.offPlanRealEstate },
      { name: "Cash", value: assetsBreakdown.cash },
      { name: "Gold", value: assetsBreakdown.gold },
      { name: "Silver", value: assetsBreakdown.silver },
      { name: "Other", value: assetsBreakdown.other },
  ].sort((a,b) => b.value - a.value); // Sort descending

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = totalAssets > 0 ? (value / totalAssets) * 100 : 0;
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg text-sm">
          <p className="font-bold">{name}</p>
          <p>{format(value)} ({percentage.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            width={120}
            tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
             {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
