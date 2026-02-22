"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
    label: string;
    explanation: React.ReactNode;
    className?: string;
}

export function InfoTooltip({ label, explanation, className = "text-xs font-medium text-slate-400 uppercase tracking-wider" }: InfoTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="flex items-center gap-1.5 cursor-help group relative inline-flex mb-1"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
        >
            <p className={cn(className, "transition-colors", isOpen ? "text-amber-400/80" : "group-hover:text-amber-400/80")}>
                {label}
            </p>
            <Info className={cn("h-3.5 w-3.5 transition-colors", isOpen ? "text-amber-400/80" : "text-slate-500 group-hover:text-amber-400/80")} />

            {/* Tooltip Popup */}
            <div
                className={cn(
                    "absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 border border-slate-600 text-slate-200 text-[10px] shadow-2xl rounded-md transition-all duration-200 z-[100] pointer-events-none",
                    isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-1 invisible"
                )}
            >
                {explanation}
            </div>
        </div>
    );
}
