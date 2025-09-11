
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { calculateMetrics } from "@/lib/calculations";
import { useCurrency } from "@/hooks/use-currency";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data, loading: dataLoading } = useFinancialData();
  const { currency } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  
  const metrics = calculateMetrics(data, currency);
  const isLoading = dataLoading || authLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Wealth Navigator</h2>
        <p className="text-muted-foreground mb-4">Please sign in to manage your financial portfolio.</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

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
