import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/AppShell"; // We use AppShell logic if available, otherwise fallback
// FIX: Added the missing import below
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased h-screen overflow-hidden bg-[#020817]`}>
        
        <AuthProvider>
          <FinancialDataProvider>
            
            <div className="flex h-full w-full">
              
              {/* SIDEBAR BLOCK */}
              <aside className="w-64 h-full shrink-0 bg-[#111827] border-r border-white/10 z-50 flex flex-col">
                 <Sidebar />
              </aside>

              {/* CONTENT BLOCK */}
              <main className="flex-1 h-full overflow-y-auto relative bg-background/50">
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