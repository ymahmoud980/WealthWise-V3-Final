import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    WalletCards,
    TrendingDown,
    BarChart3,
    PieChart,
    Activity,
    Calculator,
    LogOut,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    LineChart,
    Globe,
    FileText,
    CalendarClock,
    HeartPulse,
    Banknote
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logOut } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    let currency = "USD";
    let setCurrency = (c: string) => { };
    try {
        const data = useFinancialData();
        currency = data.currency;
        setCurrency = data.setCurrency;
    } catch (e) { }

    useEffect(() => setMounted(true), []);

    const navItems = [
        { name: "Executive Overview", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
        { name: "Asset Portfolio", href: "/assets", icon: <WalletCards className="h-5 w-5" /> },
        { name: "Liability Tracker", href: "/liabilities", icon: <TrendingDown className="h-5 w-5" /> },
        { name: "Cash Flow Intel", href: "/breakdown", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "Investment Analytics", href: "/analytics", icon: <LineChart className="h-5 w-5" /> },
        { name: "Master Report", href: "/report", icon: <PieChart className="h-5 w-5" /> },
        { name: "AI Advisory", href: "/advisor", icon: <Activity className="h-5 w-5" /> },
        { name: "Simulators", href: "/calculator", icon: <Calculator className="h-5 w-5" /> },
        { name: "Documentation", href: "/documents", icon: <FileText className="h-5 w-5" /> },
        { name: "Outlook", href: "/outlook", icon: <CalendarClock className="h-5 w-5" /> },
        { name: "Health", href: "/health", icon: <HeartPulse className="h-5 w-5" /> },
        { name: "Trends", href: "/trends", icon: <TrendingUp className="h-5 w-5" /> },
        { name: "Cash Flow", href: "/cashflow", icon: <Banknote className="h-5 w-5" /> },
    ];

    const userImage = user?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.email || 'guest'}`;

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={cn("flex flex-col h-screen sticky top-0 bg-[#0B1120] border-r border-white/10 z-50 shrink-0 shadow-2xl transition-all duration-300", className)}
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-black/20">
                {!isCollapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold">W</div>
                        <span className="font-bold text-lg tracking-tight">Wealth <span className="text-primary">V2</span></span>
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
                <div className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 ${isCollapsed ? 'hidden' : 'block'}`}>Analytics Core</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                        <Link key={item.name} href={item.href} onClick={onClose}>
                            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                <div className={`${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "group-hover:scale-110 transition-transform"}`}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <Avatar className="h-10 w-10 border border-white/10 shrink-0 cursor-pointer shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                        <AvatarImage src={userImage} />
                        <AvatarFallback className="bg-slate-800 text-xs">YW</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Executive'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                {!isCollapsed && mounted && (
                    <div className="mt-4 px-1">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Globe className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" /></div>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-9 pl-9 pr-4 w-full rounded-lg border border-white/10 bg-black/40 text-xs font-medium text-white focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-white/10 transition-colors">
                                <option value="USD">🇺🇸 USD ($)</option><option value="KWD">🇰🇼 KWD (KD)</option><option value="EGP">🇪🇬 EGP (E£)</option><option value="TRY">🇹🇷 TRY (₺)</option><option value="EUR">🇪🇺 EUR (€)</option><option value="GBP">🇬🇧 GBP (£)</option><option value="AED">🇦🇪 AED (Dh)</option><option value="SAR">🇸🇦 SAR (SR)</option>
                            </select>
                        </div>
                    </div>
                )}
                {!isCollapsed && (
                    <button onClick={logOut} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                )}
            </div>
        </motion.div>
    );
}
