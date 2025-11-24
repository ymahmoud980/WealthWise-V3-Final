"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  ArrowRightLeft, 
  Calculator, 
  BrainCircuit 
} from "lucide-react";

// YOUR MENU LINKS
const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", color: "text-sky-500" },
  { label: "Assets", icon: Building2, href: "/assets", color: "text-emerald-500" },
  { label: "Liabilities", icon: Wallet, href: "/liabilities", color: "text-rose-500" },
  { label: "Cash Flow", icon: ArrowRightLeft, href: "/Cashflow", color: "text-violet-500" },
  { label: "Breakdown", icon: Calculator, href: "/breakdown", color: "text-orange-500" },
  { label: "Advisor", icon: BrainCircuit, href: "/advisor", color: "text-pink-700" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-white/10">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
             {/* Simple Logo Placeholder */}
             <div className="absolute inset-0 bg-primary rounded-lg opacity-20"></div>
             <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">W</div>
          </div>
          <h1 className="text-2xl font-bold">Wealth Navigator</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
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
    </div>
  );
}