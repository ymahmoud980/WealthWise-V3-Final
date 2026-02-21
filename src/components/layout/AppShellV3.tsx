"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    Home,
    LineChart,
    Wallet,
    Activity,
    PieChart,
    LogOut,
    FolderOpen,
    TrendingDown,
    Calculator,
    CalendarClock,
    HeartPulse,
    TrendingUp,
    Banknote,
    Zap,
    BookOpen
} from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export function AppShellV3({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Dynamic color shift based on wealth data
    let netWorth = 0;
    try {
        const data = useFinancialData();
        netWorth = data.metrics?.netWorth || 0;
    } catch (e) { }

    const navItems = [
        { name: "Executive", href: "/", icon: <Home className="h-5 w-5" /> },
        { name: "Assets", href: "/assets", icon: <Wallet className="h-5 w-5" /> },
        { name: "Liabilities", href: "/liabilities", icon: <TrendingDown className="h-5 w-5" /> },
        { name: "Cash flow", href: "/cashflow", icon: <Banknote className="h-5 w-5" /> },
        { name: "Breakdown", href: "/breakdown", icon: <Activity className="h-5 w-5" /> },
        { name: "Outlook", href: "/outlook", icon: <CalendarClock className="h-5 w-5" /> },
        { name: "Report", href: "/report", icon: <PieChart className="h-5 w-5" /> },
        { name: "Docs", href: "/documents", icon: <FolderOpen className="h-5 w-5" /> },
        { name: "Analytics", href: "/analytics", icon: <LineChart className="h-5 w-5" /> },
        { name: "Health", href: "/health", icon: <HeartPulse className="h-5 w-5" /> },
        { name: "Trends", href: "/trends", icon: <TrendingUp className="h-5 w-5" /> },
        { name: "Simulators", href: "/calculator", icon: <Calculator className="h-5 w-5" /> },
        { name: "AI Advisor", href: "/advisor", icon: <Zap className="h-5 w-5" /> },
        { name: "Guide", href: "/guide", icon: <BookOpen className="h-5 w-5" /> },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[#02040a] text-white overflow-hidden selection:bg-emerald-500/30">

            {/* V3 Cinematic Aurora Background Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Top Left Liquid Emerald (Wealth/Growth color) */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="aurora-orb w-[600px] h-[600px] bg-emerald-500/20 top-[-20%] left-[-10%]"
                />
                {/* Bottom Right Cyber Blue */}
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="aurora-orb w-[800px] h-[800px] bg-blue-600/20 bottom-[-30%] right-[-10%]"
                />
                {/* Center Deep Violet Mesh */}
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="aurora-orb w-[500px] h-[500px] bg-violet-600/10 top-[30%] left-[40%]"
                />
            </div>

            {/* Main Content Area - Rendered above background, behind dock */}
            <main className="relative z-10 w-full h-full min-h-screen pb-32 overflow-y-auto no-scrollbar scroll-smooth">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-[1600px] mx-auto px-4 sm:px-8 py-10"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-min">
                <motion.nav
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="glass-dock flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar max-w-[95vw] gap-1 sm:gap-2 p-2 px-4 shadow-2xl"
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} title={item.name} className="relative group">
                                <div
                                    className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${isActive ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {item.icon}
                                </div>
                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <motion.div layoutId="activeDockTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="w-[1px] h-8 bg-white/10 mx-2 flex-shrink-0" />

                    <button
                        onClick={() => logout()}
                        title="Sign Out"
                        className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 relative group cursor-pointer"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </motion.nav>
            </div>

        </div>
    );
}
