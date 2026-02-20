"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Trash2, Download, Upload, Eye, EyeOff, ShieldCheck, PieChart, Activity, LogOut, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { PriceControlCard } from "@/components/dashboard/PriceControlCard";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { emptyFinancialData } from "@/lib/data";
import { fetchLiveRates, initialRates, MarketRates } from "@/lib/marketPrices";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/dashboard/NotificationBell"; // <--- Imported

export default function DashboardPage() {
  const financialContext = useFinancialData();
  const authContext = useAuth();

  const data = financialContext?.data || emptyFinancialData;
  const setData = financialContext?.setData || (() => { });
  const metrics = financialContext?.metrics || { netWorth: 0, totalAssets: 0, totalLiabilities: 0, netCashFlow: 0, assets: { existingRealEstate: 0, offPlanRealEstate: 0, cash: 0, gold: 0, silver: 0, other: 0 } };
  const syncStatus = (financialContext as any)?.syncStatus || "synced";
  const user = authContext?.user;

  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [marketRates, setMarketRates] = useState<MarketRates>(initialRates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchLiveRates().then((rates) => {
      if (rates && typeof rates === 'object') setMarketRates(rates);
    });
  }, []);

  const handleClearData = () => { setData(emptyFinancialData); setIsClearAlertOpen(false); }

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wealth_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.assets) {
          setData(parsed);
          alert("Data imported successfully!");
        } else {
          alert("Invalid file format");
        }
      } catch (err) { alert("Error reading file"); }
    };
    reader.readAsText(file);
  };

  if (!mounted) return null;

  const privacyClass = privacyMode ? "blur-xl select-none transition-all duration-500" : "transition-all duration-500";
  const userImage = user?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  let lastLogin = "Just now";
  try {
    const meta = (user as any)?.metadata;
    if (meta?.lastSignInTime) lastLogin = new Date(meta.lastSignInTime).toLocaleString();
  } catch (e) { }

  const safeEur = marketRates?.EUR || 0.95;
  const safeGold = (marketRates?.Gold !== undefined && marketRates?.Gold !== null) ? marketRates.Gold.toFixed(2) : "Loading...";
  const safeSilver = (marketRates?.Silver !== undefined && marketRates?.Silver !== null) ? marketRates.Silver.toFixed(2) : "Loading...";

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />

      {/* HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-slate-800">
            <img src={userImage} alt="User" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Wealth <span className="text-primary">Navigator</span></h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">PRO INVESTOR</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mt-1">
              <span className="font-medium text-slate-300">{user?.displayName || user?.email}</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-600"></span>
              <span>Last Access: <span className="text-amber-400 font-mono">{lastLogin}</span></span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-600"></span>
              {syncStatus === "saving" && <span className="text-amber-500 animate-pulse flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Syncing...</span>}
              {syncStatus === "synced" && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Synced</span>}
              {syncStatus === "error" && <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Sync Error</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* --- NEW: Notification Bell --- */}
          <NotificationBell />

          <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <PlusCircle className="mr-2 h-4 w-4" /> Quick Add
          </Button>

          <Button variant="outline" onClick={() => setPrivacyMode(!privacyMode)} className="border-primary/20 hover:bg-primary/10 h-9 text-xs">
            {privacyMode ? <Eye className="mr-2 h-3 w-3" /> : <EyeOff className="mr-2 h-3 w-3" />} {privacyMode ? "Show" : "Hide"}
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="border-white/10 h-9 text-xs"><Upload className="mr-2 h-3 w-3" /> Import</Button>
          <Button variant="default" onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs"><Download className="mr-2 h-3 w-3" /> Export</Button>
        </div>
      </header>

      {/* TICKER */}
      <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-xs font-mono text-muted-foreground py-3 px-4 border-y border-white/5 bg-black/20 rounded-lg no-scrollbar">
        <span className="flex items-center gap-2 text-primary font-bold"><Activity className="h-3 w-3" /> LIVE:</span>
        <span className="text-emerald-400">USD/EUR: {safeEur}</span>
        <span className="text-amber-500">GOLD: ${safeGold}</span>
        <span className="text-slate-300">SILVER: ${safeSilver}</span>
      </div>

      {/* STATS & CONTENT */}
      {metrics?.totalAssets === 0 && metrics?.totalLiabilities === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-panel rounded-2xl border border-white/5 space-y-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <PieChart className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to Wealth Navigator</h2>
            <p className="text-muted-foreground">Your dashboard is currently empty. Let's get started by adding your first asset or connecting an account to track your wealth journey.</p>
          </div>
          <Button className="h-12 px-8 font-bold shadow-lg shadow-emerald-500/20 border border-emerald-500/50 text-md bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-300">
            <PlusCircle className="mr-2 h-5 w-5" /> Add First Asset
          </Button>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${privacyClass}`}>
            <StatCard title="Net Worth" value={metrics?.netWorth || 0} icon={<DollarSign className="text-amber-500" />} isCurrency={true} />
            <StatCard title="Total Assets" value={metrics?.totalAssets || 0} icon={<TrendingUp className="text-emerald-500" />} isCurrency={true} />
            <StatCard title="Liabilities" value={metrics?.totalLiabilities || 0} icon={<TrendingDown className="text-rose-500" />} isCurrency={true} />
            <StatCard title="Net Cash Flow" value={metrics?.netCashFlow || 0} icon={<ArrowRightLeft className="text-blue-500" />} isCurrency={true} />

            {/* --- PROFESSIONAL METRICS --- */}
            <StatCard
              title="Leverage %"
              value={(metrics as any)?.professional?.leverageRatio?.toFixed(1) || 0}
              icon={<PieChart className="text-purple-400" />}
              isCurrency={false}
            />
            <StatCard
              title="Liquidity (Mos)"
              value={(metrics as any)?.professional?.liquidityMonths?.toFixed(1) || 0}
              icon={<ShieldCheck className="text-blue-400" />}
              isCurrency={false}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className={`grid gap-8 md:grid-cols-2 ${privacyClass}`}>
                <div className="glass-panel p-1 rounded-xl"><UpcomingPayments /></div>
                <div className="glass-panel p-1 rounded-xl"><UpcomingRents rents={data?.assets?.realEstate || []} /></div>
              </div>
              <Card className="glass-panel border-0"><CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader><CardContent className={privacyClass}><AssetAllocationChart assetsBreakdown={metrics?.assets} totalAssets={metrics?.totalAssets || 0} /></CardContent></Card>
            </div>
            <div className="space-y-8">
              <div className="glass-panel p-1 rounded-xl"><PriceControlCard /></div>
              <Card className="border-destructive/30 bg-destructive/5"><CardHeader><CardTitle className="text-destructive">Data Zone</CardTitle><CardDescription>Danger Zone</CardDescription></CardHeader><CardContent><Button variant="outline" className="w-full border-destructive/50 text-destructive" onClick={() => setIsClearAlertOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Clear Data</Button></CardContent></Card>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset?</AlertDialogTitle><AlertDialogDescription>Delete all data?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearData}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}