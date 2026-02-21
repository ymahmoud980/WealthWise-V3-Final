import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { AppShellV3 } from "@/components/layout/AppShellV3";

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
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased text-white`} suppressHydrationWarning>
        <AuthProvider>
          <FinancialDataProvider>
            {/* WRAP CONTENT IN V3 APP SHELL */}
            <AppShellV3>
              {children}
            </AppShellV3>
            <Toaster />
          </FinancialDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}