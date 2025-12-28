"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Building2, Wallet, ArrowRightLeft, Calculator, 
  BrainCircuit, LogOut, Activity, LineChart, FileText, Lightbulb, 
  FileBarChart, Globe, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Button } from "@/components/ui/button";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", color: "text-sky-500" },
  { label: "Assets", icon: Building2, href: "/assets", color: "text-emerald-500" },
  { label: "Liabilities", icon: Wallet, href: "/liabilities", color: "text-rose-500" },
  { label: "Cash Flow", icon: ArrowRightLeft, href: "/cashflow", color: "text-violet-500" },
  { label: "Breakdown", icon: Calculator, href: "/breakdown", color: "text-orange-500" },
  { label: "Fin. Health", icon: Activity, href: "/health", color: "text-green-600" },
  { label: "Trends", icon: LineChart, href: "/trends", color: "text-blue-400" },
  { label: "Calculator", icon: Calculator, href: "/calculator", color: "text-yellow-500" },
  { label: "AI Advisor", icon: BrainCircuit, href: "/advisor", color: "text-pink-700" },
  { label: "Insights", icon: Lightbulb, href: "/insights", color: "text-amber-400" },
  { label: "Reports", icon: FileBarChart, href: "/report", color: "text-indigo-400" },
  { label: "Documents", icon: FileText, href: "/documents", color: "text-slate-400" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  let currency = "USD";
  let setCurrency = (c: string) => {};
  try {
      const data = useFinancialData();
      currency = data.currency;
      setCurrency = data.setCurrency;
  } catch(e) {}

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col h-full bg-[#111827] text-white relative">
      
      {/* 1. FIXED HEADER (Prevents Name Clipping) */}
      <div className="p-4 pl-6 border-b border-white/10 shrink-0 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={onClose}>
           <div className="h-8 w-8 mr-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center font-bold text-white shadow-lg shrink-0">W</div>
           {/* Fix: Adjusted size to fit "Wealth Navigator" perfectly */}
           <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">Wealth Navigator</h1>
        </Link>
        
        {/* Mobile Close Button */}
        {onClose && (
            <Button variant="ghost" size="icon" className="md:hidden text-zinc-400" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
        )}
      </div>

      {/* 2. SCROLLABLE LINKS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* 3. FIXED FOOTER (Currency & Logout) */}
      <div className="px-3 py-4 border-t border-white/10 bg-[#0f172a]/50 shrink-0 space-y-3">
        {mounted && (
            <div className="relative group px-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 pl-10 pr-4 w-full rounded-lg border border-white/10 bg-black/40 text-sm text-white focus:ring-primary appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="KWD">🇰🇼 KWD (KD)</option>
                <option value="EGP">🇪🇬 EGP (E£)</option>
                <option value="TRY">🇹🇷 TRY (₺)</option>
                <option value="EUR">🇪🇺 EUR (€)</option>
                <option value="GBP">🇬🇧 GBP (£)</option>
                <option value="AED">🇦🇪 AED (Dh)</option>
                <option value="SAR">🇸🇦 SAR (SR)</option>
                </select>
            </div>
        )}
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-white/10">
            <LogOut className="h-5 w-5 mr-3" /> Logout
        </Button>
      </div>
    </div>
  );
}