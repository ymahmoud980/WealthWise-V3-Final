
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function DashboardPage() {
  const { data, metrics } = useFinancialData();

  return (
    <div 
      className="flex flex-col gap-8 bg-cover bg-center p-4 md:p-6 lg:p-8 rounded-xl -m-4"
      style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Net Worth" value={metrics.netWorth} icon={<DollarSign className="text-primary" />} isCurrency={true} />
        <StatCard title="Asset Value" value={metrics.totalAssets} icon={<TrendingUp className="text-green-500" />} isCurrency={true} />
        <StatCard title="Liabilities" value={metrics.totalLiabilities} icon={<TrendingDown className="text-red-500" />} isCurrency={true} />
        <StatCard title="Avg. Net Cash Flow" value={metrics.netCashFlow} icon={<ArrowRightLeft className="text-blue-500" />} isCurrency={true} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
          <UpcomingPayments />
          <UpcomingRents rents={data.assets.realEstate} />
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>How your assets are distributed across different categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetAllocationChart assetsBreakdown={metrics.assets} totalAssets={metrics.totalAssets} />
          </CardContent>
        </Card>
    </div>
  );
}
