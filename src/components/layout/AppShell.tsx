"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#020817] overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR (Visible on md+, Hidden on mobile) */}
      <aside className="hidden md:flex w-64 h-full shrink-0 bg-[#111827] border-r border-white/10 z-50">
         <Sidebar />
      </aside>

      {/* 2. MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
           {/* Dark Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             onClick={() => setIsMobileMenuOpen(false)}
           />
           {/* Sidebar Slide-in */}
           <div className="absolute left-0 top-0 h-full w-64 bg-[#111827] border-r border-white/10 animate-in slide-in-from-left duration-300">
              <div className="absolute top-2 right-2 z-50">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-6 w-6 text-zinc-400" />
                  </Button>
              </div>
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
           </div>
        </div>
      )}

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* MOBILE HEADER (Menu Button) */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-[#111827]/95 backdrop-blur z-40 shrink-0">
           <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-white" />
           </Button>
           <span className="ml-3 font-bold text-white text-lg">Wealth Navigator</span>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-0">
          {children}
        </main>
      </div>

    </div>
  );
}