
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Trash2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { emptyFinancialData } from "@/lib/data";
import { PriceControlCard } from "@/components/dashboard/PriceControlCard";


export default function DashboardPage() {
  const { data, setData, metrics } = useFinancialData();
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);

  const handleClearData = () => {
    setData(emptyFinancialData);
    setIsClearAlertOpen(false);
  }

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

      <div className="grid gap-8 lg:grid-cols-3">
          <UpcomingPayments />
          <UpcomingRents rents={data.assets.realEstate} />
          <PriceControlCard />
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
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Start Fresh</CardTitle>
          <CardDescription>
            Clear all the default sample data to start entering your own financial information from a clean slate. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setIsClearAlertOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all current financial data, including assets, liabilities, and history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
              Yes, Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
