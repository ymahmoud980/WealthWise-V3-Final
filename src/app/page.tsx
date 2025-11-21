"use client";

import { useState, useEffect } from "react";
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
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Trash2, 
  Download, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  PieChart
} from "lucide-react";

// Components
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { PriceControlCard } from "@/components/dashboard/PriceControlCard";

// Data
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { emptyFinancialData } from "@/lib/data";

export default function DashboardPage() {
  const { data, setData, metrics } = useFinancialData();
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClearData = () => {
    setData(emptyFinancialData);
    setIsClearAlertOpen(false);
  }

  const handleExport = () => {
    alert("Preparing your PDF Wealth Report...");
    // In a real app, you would trigger a PDF generation function here
  }

  // Helper to obscure numbers if privacy mode is on
  const secureValue = (val: number) => privacyMode ? -1 : val; 
  // Note: We pass -1 or a flag, assuming StatCard handles formatting. 
  // If StatCard is rigid, we use the CSS blur class on the container below.

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8">
      
      {/* --- TOP HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Wealth <span className="text-primary">Navigator</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setPrivacyMode(!privacyMode)}
            className="border-primary/20 hover:bg-primary/10"
          >
            {privacyMode ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
            {privacyMode ? "Show Values" : "Hide Values"}
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>

      {/* --- KEY STATS ROW --- */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 transition-all duration-500 ${privacyMode ? "blur-sm" : ""}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <div className="relative h-full">
            <StatCard 
              title="Net Worth" 
              value={metrics.netWorth} 
              icon={<DollarSign className="text-amber-500 h-6 w-6" />} 
              isCurrency={true} 
            />
          </div>
        </div>

        <StatCard 
          title="Asset Value" 
          value={metrics.totalAssets} 
          icon={<TrendingUp className="text-emerald-500 h-6 w-6" />} 
          isCurrency={true} 
        />
        <StatCard 
          title="Liabilities" 
          value={metrics.totalLiabilities} 
          icon={<TrendingDown className="text-rose-500 h-6 w-6" />} 
          isCurrency={true} 
        />
        <StatCard 
          title="Net Cash Flow" 
          value={metrics.netCashFlow} 
          icon={<ArrowRightLeft className="text-blue-500 h-6 w-6" />} 
          isCurrency={true} 
        />
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Operations */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="glass-panel rounded-xl p-1">
               <UpcomingPayments />
            </div>
            <div className="glass-panel rounded-xl p-1">
               <UpcomingRents rents={data.assets.realEstate} />
            </div>
          </div>
          
          {/* Wide Chart Section */}
          <Card className="glass-panel border-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Distribution of wealth across categories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className={privacyMode ? "blur-md transition-all" : "transition-all"}>
              <AssetAllocationChart assetsBreakdown={metrics.assets} totalAssets={metrics.totalAssets} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Controls & Utility */}
        <div className="space-y-8">
          <div className="glass-panel rounded-xl p-1">
            <PriceControlCard />
          </div>

          {/* Danger Zone / Data Management */}
          <Card className="border-destructive/30 bg-destructive/5 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-destructive" />
                 <CardTitle className="text-destructive">Data Management</CardTitle>
              </div>
              <CardDescription>
                Manage your local session data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-white transition-colors"
                onClick={() => setIsClearAlertOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- ALERTS --- */}
      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent className="glass-panel border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Factory Reset</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all tracked assets, liabilities, and cash flow history from your local session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90 text-white">
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}