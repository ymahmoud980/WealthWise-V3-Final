"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full w-full bg-[#020817]">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 h-full shrink-0 bg-[#111827] border-r border-white/10 overflow-y-auto z-50">
         <Sidebar />
      </aside>

      {/* 2. MOBILE SIDEBAR (Drawer) */}
      {/* Only visible when isOpen is true. Covers the screen with a dark overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
           {/* Dark Backdrop (Click to close) */}
           <div 
             className="fixed inset-0 bg-black/80 backdrop-blur-sm"
             onClick={() => setIsMobileMenuOpen(false)}
           />
           
           {/* The Sliding Menu */}
           <div className="relative w-64 h-full bg-[#111827] border-r border-white/10 animate-in slide-in-from-left duration-300">
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
           </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* MOBILE TOP BAR (Hidden on Desktop) */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl z-40 sticky top-0">
           <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-white" />
           </Button>
           <span className="ml-3 font-bold text-white text-lg">Wealth Navigator</span>
        </div>

        {/* The Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-0 md:p-0">
          {children}
        </main>
      </div>

    </div>
  );
}