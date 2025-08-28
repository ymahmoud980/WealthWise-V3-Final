"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { assets } from "@/lib/data"
import { useCurrency } from "@/hooks/use-currency"

const data = assets.reduce((acc, asset) => {
  const existing = acc.find(item => item.name === asset.location);
  if (existing) {
    existing.value += asset.marketValue;
  } else {
    acc.push({ name: asset.location, value: asset.marketValue });
  }
  return acc;
}, [] as { name: string; value: number }[]);

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

export function AssetAllocationChart() {
  const { format } = useCurrency();
  
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
            }}
            formatter={(value: number) => [format(value), "Value"]}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
