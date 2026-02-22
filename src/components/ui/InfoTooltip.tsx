"use client";

import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
    label: string;
    explanation: React.ReactNode;
    className?: string;
}

export function InfoTooltip({ label, explanation, className = "text-xs font-medium text-slate-400 uppercase tracking-wider" }: InfoTooltipProps) {
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger className="flex items-center gap-1.5 cursor-help group inline-flex mb-1" type="button">
                    <p className={`${className} group-hover:text-amber-400/80 transition-colors`}>
                        {label}
                    </p>
                    <Info className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400/80 transition-colors" />
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    align="start"
                    className="bg-slate-800 border-slate-600 text-slate-200 text-xs shadow-2xl p-3 max-w-xs z-50 pointer-events-none"
                >
                    {explanation}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
