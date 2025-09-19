
"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useCurrency } from "@/hooks/use-currency";
import { format as formatDate, parseISO } from 'date-fns';
import { AreaChart } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";


export default function TrendsPage() {
  const { data } = useFinancialData();
  const { format, currency } = useCurrency();

  // 1. Sort the history data directly
  const sortedHistory = (data.history || [])
    .slice() // Create a shallow copy to avoid mutating original data
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // 2. Map sorted data to the format required by the chart
  const chartData = sortedHistory.map(entry => {
    // We need to convert the stored values to the currently selected display currency.
    // The history values are stored in 'USD' by default when snapshot is taken.
    // Let's assume they are stored in a base currency, e.g. USD and we convert to the current one
    const baseCurrencyForHistory = 'USD'; // Or whatever base currency is assumed for history snapshots

    // This is a simplified conversion. Ideally, the currency of the snapshot would be stored with it.
    // For now, we assume all history is stored as USD equivalent at the time of snapshot.
    
    // The history entries already store the calculated values. We just need to format the date.
    // The values are calculated in the currency that was active when the snapshot was taken.
    // For this chart, let's assume we display them as is, and the user knows which currency was active.
    // The format function will use the currently selected currency symbol, which might be misleading.
    
    // Let's pass the raw numbers to the chart and let the tooltip and Y-axis formatters handle it.
    return {
      date: formatDate(parseISO(entry.date), 'MMM d, yyyy'),
      "Net Worth": entry.netWorth,
      "Total Assets": entry.totalAssets,
      "Total Liabilities": entry.totalLiabilities,
    };
  });


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.dataKey}: ${format(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
       <div className="flex items-start gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <AreaChart className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Financial Trends</h1>
            <p className="text-muted-foreground">
                Visualize your financial journey over time. Click "Save Snapshot" in the header to add a new data point.
            </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historical Financial Metrics</CardTitle>
          <CardDescription>
            This chart shows the trends of your Net Worth, Total Assets, and Total Liabilities over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
             <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => format(value).replace(/[^0-9.,-]/g, '')}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="Net Worth" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Total Assets" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                        <Line type="monotone" dataKey="Total Liabilities" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[400px] flex items-center justify-center text-center text-muted-foreground">
                <div>
                    <p>Not enough data to display a trend.</p>
                    <p>Please save at least two financial snapshots using the "Save Snapshot" button in the header.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
