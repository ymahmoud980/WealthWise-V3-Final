import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/AppShell"; // Import the new Shell

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
            
            {/* USE THE APP SHELL (Handles Mobile/Desktop Logic) */}
            <AppShell>
               {children}
            </AppShell>

            <Toaster />
          </FinancialDataProvider>
        </AuthProvider>

      </body>
    </html>
  );
}