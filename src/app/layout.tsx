import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/ui/sidebar"; // <--- Importing the file we just fixed

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
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased min-h-screen`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black"></div>
        
        <AuthProvider>
          <FinancialDataProvider>
            <div className="flex h-screen overflow-hidden">
              {/* SIDEBAR CONTAINER */}
              <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                 <Sidebar />
              </div>
              
              {/* MAIN CONTENT CONTAINER */}
              <main className="flex-1 md:pl-64 flex flex-col overflow-y-auto h-full relative">
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