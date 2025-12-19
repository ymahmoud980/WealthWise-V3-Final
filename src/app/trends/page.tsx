"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useCurrency } from "@/hooks/use-currency";
import { format as formatDate, parseISO } from 'date-fns';
import { AreaChart, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TrendsPage() {
  const { data, setData, metrics } = useFinancialData();
  const { format } = useCurrency();
  const [isSaving, setIsSaving] = useState(false);

  // 1. SAVE SNAPSHOT FUNCTION
  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    try {
        const newEntry = {
            date: new Date().toISOString(),
            netWorth: metrics.netWorth, // Save in Base Currency (USD usually) or Current
            totalAssets: metrics.totalAssets,
            totalLiabilities: metrics.totalLiabilities
        };

        const updatedData = {
            ...data,
            history: [...(data.history || []), newEntry]
        };

        // Update Context (Triggers Cloud Save)
        setData(updatedData);
        alert("Snapshot saved! Trend updated.");
    } catch (e) {
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  // 2. PREPARE DATA
  const sortedHistory = (data.history || [])
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedHistory.map(entry => ({
      date: formatDate(parseISO(entry.date), 'MMM d'),
      "Net Worth": entry.netWorth,
      "Assets": entry.totalAssets,
      "Liabilities": entry.totalLiabilities,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[#0f172a]/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-md">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm font-mono">
              {`${pld.dataKey}: ${format(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6 rounded-xl">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 text-blue-400 p-3 rounded-xl border border-blue-500/20">
                <AreaChart className="h-8 w-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">Financial Trends</h1>
                <p className="text-muted-foreground">Track your wealth journey over time.</p>
            </div>
        </div>
        <Button onClick={handleSaveSnapshot} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Camera className="mr-2 h-4 w-4" /> 
            {isSaving ? "Saving..." : "Take Snapshot"}
        </Button>
      </div>

      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Net Worth, Assets, and Liabilities over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
             <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                        <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <Line type="monotone" dataKey="Net Worth" stroke="#fbbf24" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Assets" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Liabilities" stroke="#f43f5e" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[400px] flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                <AreaChart className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-white">No trend data yet.</p>
                <p className="text-sm max-w-md mt-2">Click <span className="text-blue-400 font-bold">Take Snapshot</span> above to record your current financial status as the first data point.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}