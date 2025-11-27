import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/ui/sidebar"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Wealth Navigator",
  description: "Personal Wealth Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased h-screen overflow-hidden bg-[#020817]`}>
        
        <AuthProvider>
          <FinancialDataProvider>
            
            {/* --- FLEX CONTAINER (The Unbreakable Fix) --- */}
            <div className="flex h-full w-full">
              
              {/* 1. SIDEBAR COLUMN */}
              {/* shrink-0 = Do not let this shrink, ever. */}
              <aside className="w-64 h-full shrink-0 bg-[#111827] border-r border-white/10 overflow-y-auto">
                 <Sidebar />
              </aside>

              {/* 2. MAIN CONTENT COLUMN */}
              {/* flex-1 = Take up all remaining space */}
              <main className="flex-1 h-full overflow-y-auto relative">
                {children}
              </main>

            </div>

            <Toaster />
          </FinancialDataProvider>
        </AuthProvider>

      </body>
    </html>
  );
}