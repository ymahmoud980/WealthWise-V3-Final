
"use client";

import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useCurrency } from "@/hooks/use-currency";
import { format as formatDate } from 'date-fns';
import { AreaChart } from "lucide-react";

export default function TrendsPage() {
  const { data } = useFinancialData();
  const { format } = useCurrency();

  const chartData = (data.history || []).map(entry => ({
    date: formatDate(new Date(entry.date), 'MMM d, yyyy'),
    "Net Worth": entry.netWorth,
    "Total Assets": entry.totalAssets,
    "Total Liabilities": entry.totalLiabilities,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


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
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => format(value).replace(/[^0-9-]/g, '') + 'K'} />
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
