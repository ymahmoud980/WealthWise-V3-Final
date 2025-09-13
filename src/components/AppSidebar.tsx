
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Home,
  Landmark,
  Wallet,
  BrainCircuit,
  Calculator,
  Settings,
  FileText,
  Sparkles,
  HeartPulse,
  AreaChart
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/assets", label: "Assets", icon: <Home /> },
  { href: "/liabilities", label: "Liabilities", icon: <Landmark /> },
  { href: "/cashflow", label: "Cash Flow", icon: <Wallet /> },
  { href: "/breakdown", label: "Calculation Breakdown", icon: <FileText /> },
  { href: "/trends", label: "Trends", icon: <AreaChart /> },
  { href: "/health", label: "Financial Health", icon: <HeartPulse /> },
  { href: "/advisor", label: "AI Advisor", icon: <BrainCircuit /> },
  { href: "/insights", label: "AI Insights", icon: <Sparkles /> },
  { href: "/calculator", label: "Currency Calculator", icon: <Calculator /> },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <div className="bg-primary p-2 rounded-lg">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary-foreground"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
            </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-semibold tracking-tight">Wealth Navigator</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="#">
                <SidebarMenuButton tooltip={{ children: 'Settings' }} disabled>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
