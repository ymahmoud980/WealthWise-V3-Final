"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp } from "lucide-react";

export function WealthProjector({ currentNetWorth }: { currentNetWorth: number }) {
  const [years, setYears] = useState(10);
  const [contribution, setContribution] = useState(2000); // Monthly add
  const [rate, setRate] = useState(8); // Annual return %

  // Calculate projection curve
  const data = Array.from({ length: years + 1 }, (_, i) => {
    const months = i * 12;
    const ratePerMonth = rate / 100 / 12;
    // Future Value of Lump Sum + Future Value of Series
    const fvLump = currentNetWorth * Math.pow(1 + ratePerMonth, months);
    const fvSeries = contribution * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth);
    const total = fvLump + fvSeries;
    
    return {
      year: `Year ${i}`,
      value: Math.round(total)
    };
  });

  const finalValue = data[data.length - 1].value;

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400 h-5 w-5" />
            <CardTitle>Wealth Projection (AI Forecast)</CardTitle>
        </div>
      </CardHeader>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Projection Period: <span className="text-primary">{years} Years</span></label>
                <Slider value={[years]} min={1} max={30} step={1} onValueChange={(v) => setYears(v[0])} />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Monthly Contribution: <span className="text-primary">${contribution}</span></label>
                <Slider value={[contribution]} min={0} max={50000} step={500} onValueChange={(v) => setContribution(v[0])} />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Exp. Annual Return: <span className="text-primary">{rate}%</span></label>
                <Slider value={[rate]} min={1} max={20} step={0.5} onValueChange={(v) => setRate(v[0])} />
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/5 mt-4">
                <p className="text-sm text-muted-foreground">Projected Net Worth</p>
                <p className="text-2xl font-bold text-emerald-400">${finalValue.toLocaleString()}</p>
            </div>
        </div>

        <div className="md:col-span-2 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}