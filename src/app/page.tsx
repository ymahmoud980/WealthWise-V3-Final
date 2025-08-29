
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
import { calculateMetrics } from "@/lib/calculations";
import { useCurrency } from "@/hooks/use-currency";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function DashboardPage() {
  const { data } = useFinancialData();
  const { currency } = useCurrency();
  
  const metrics = calculateMetrics(data, currency);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Net Worth" value={metrics.netWorth} icon={<DollarSign className="text-primary" />} isCurrency={true} />
        <StatCard title="Asset Value" value={metrics.totalAssets} icon={<TrendingUp className="text-green-500" />} isCurrency={true} />
        <StatCard title="Liabilities" value={metrics.totalLiabilities} icon={<TrendingDown className="text-red-500" />} isCurrency={true} />
        <StatCard title="Avg. Net Cash Flow" value={metrics.netCashFlow} icon={<ArrowRightLeft className="text-blue-500" />} isCurrency={true} />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>How your assets are distributed.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetAllocationChart assetsBreakdown={metrics.assets} totalAssets={metrics.totalAssets} />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid gap-8">
          <UpcomingPayments payments={data.liabilities.installments} />
          <UpcomingRents rents={data.assets.realEstate} />
        </div>
      </div>
    </div>
  );
}
