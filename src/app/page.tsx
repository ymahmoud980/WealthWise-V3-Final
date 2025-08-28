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

export default function DashboardPage() {
  const netWorth = 1250000;
  const assetValue = 1500000;
  const liabilities = 250000;
  const cashFlow = 3500;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Net Worth" value={netWorth} icon={<DollarSign className="text-primary" />} />
        <StatCard title="Asset Value" value={assetValue} icon={<TrendingUp className="text-green-500" />} />
        <StatCard title="Liabilities" value={liabilities} icon={<TrendingDown className="text-red-500" />} />
        <StatCard title="Avg. Net Cash Flow" value={cashFlow} icon={<ArrowRightLeft className="text-blue-500" />} />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution of your assets by location.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetAllocationChart />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid gap-8">
          <UpcomingPayments />
          <UpcomingRents />
        </div>
      </div>
    </div>
  );
}
