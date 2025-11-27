"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Trash2, Download, Upload, Eye, EyeOff, ShieldCheck, PieChart, Activity, LogOut } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { UpcomingRents } from "@/components/dashboard/UpcomingRents";
import { PriceControlCard } from "@/components/dashboard/PriceControlCard";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { emptyFinancialData } from "@/lib/data";
import { fetchLiveRates, initialRates, MarketRates } from "@/lib/marketPrices";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  // 1. Safe Destructuring with Defaults
  const financialContext = useFinancialData();
  const authContext = useAuth();
  
  // Safety: If context is missing (rare), prevent crash
  const data = financialContext?.data || emptyFinancialData;
  const setData = financialContext?.setData || (() => {});
  const metrics = financialContext?.metrics || { netWorth: 0, totalAssets: 0, totalLiabilities: 0, netCashFlow: 0, assets: { existingRealEstate: 0, offPlanRealEstate: 0, cash: 0, gold: 0, silver: 0, other: 0 } };
  const user = authContext?.user;
  const logout = authContext?.logout || (() => {});

  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [marketRates, setMarketRates] = useState<MarketRates>(initialRates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchLiveRates().then((rates) => { 
        // Safety check before setting state
        if(rates && typeof rates === 'object') setMarketRates(rates); 
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
            if(parsed && parsed.assets) {
                setData(parsed);
                alert("Data imported successfully!");
            } else {
                alert("Invalid file format");
            }
        } catch(err) { alert("Error reading file"); }
    };
    reader.readAsText(file);
  };

  // Prevent Hydration Error (Server vs Client)
  if (!mounted) return null;

  const privacyClass = privacyMode ? "blur-xl select-none transition-all duration-500" : "transition-all duration-500";

  // --- SAFE USER DATA ---
  // We use Optional Chaining (?.) everywhere to prevent crashes if user is loading
  const emailName = user?.email ? user.email.split('@')[0] : "Investor";
  const displayName = user?.displayName || emailName;
  const userImage = user?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  
  // Safe Date Parsing
  let lastLogin = "Just now";
  try {
      const meta = (user as any)?.metadata;
      if (meta?.lastSignInTime) {
          lastLogin = new Date(meta.lastSignInTime).toLocaleString();
      }
  } catch (e) {
      // Ignore date errors
  }

  // Safe Market Data (Prevent crash if Gold is undefined)
  const safeGold = marketRates?.Gold ? marketRates.Gold.toFixed(2) : "0.00";
  const safeSilver = marketRates?.Silver ? marketRates.Silver.toFixed(2) : "0.00";
  const safeEur = marketRates?.EUR || 0.92;

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />

      {/* --- RICH HEADER --- */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          
          {/* AVATAR BOX */}
          <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-slate-800">
             <img src={userImage} alt="User" className="h-full w-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Wealth <span className="text-primary">Navigator</span>
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">
                    PRO INVESTOR
                </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mt-1">
               <span className="font-medium text-slate-300">{displayName}</span>
               <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-600"></span>
               <span>Last Access: <span className="text-amber-400 font-mono">{lastLogin}</span></span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" onClick={() => setPrivacyMode(!privacyMode)} className="border-primary/20 hover:bg-primary/10 h-9 text-xs">
            {privacyMode ? <Eye className="mr-2 h-3 w-3" /> : <EyeOff className="mr-2 h-3 w-3" />}
            {privacyMode ? "Show" : "Hide"}
          </Button>
          
          <Button variant="outline" onClick={handleImportClick} className="border-white/10 h-9 text-xs">
            <Upload className="mr-2 h-3 w-3" /> Import
          </Button>

          <Button variant="default" onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs">
            <Download className="mr-2 h-3 w-3" /> Export
          </Button>
        </div>
      </header>

      {/* --- LIVE TICKER (CRASH PROOF) --- */}
      <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-xs font-mono text-muted-foreground py-3 px-4 border-y border-white/5 bg-black/20 rounded-lg no-scrollbar">
        <span className="flex items-center gap-2 text-primary font-bold"><Activity className="h-3 w-3" /> LIVE:</span>
        <span className="text-emerald-400">USD/EUR: {safeEur}</span>
        <span className="text-amber-500">GOLD: ${safeGold}</span>
        <span className="text-slate-300">SILVER: ${safeSilver}</span>
      </div>

      {/* --- STATS --- */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${privacyClass}`}>
        <StatCard title="Net Worth" value={metrics?.netWorth || 0} icon={<DollarSign className="text-amber-500" />} isCurrency={true} />
        <StatCard title="Asset Value" value={metrics?.totalAssets || 0} icon={<TrendingUp className="text-emerald-500" />} isCurrency={true} />
        <StatCard title="Liabilities" value={metrics?.totalLiabilities || 0} icon={<TrendingDown className="text-rose-500" />} isCurrency={true} />
        <StatCard title="Net Cash Flow" value={metrics?.netCashFlow || 0} icon={<ArrowRightLeft className="text-blue-500" />} isCurrency={true} />
      </div>

      {/* --- CONTENT --- */}
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

      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset?</AlertDialogTitle><AlertDialogDescription>Delete all data?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearData}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}