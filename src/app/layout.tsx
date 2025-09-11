
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { FinancialDataProvider } from '@/contexts/FinancialDataContext';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Wealth Navigator',
  description: 'Your personal dashboard for financial clarity and growth.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CurrencyProvider>
            <FinancialDataProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="min-h-screen">
                  <AppHeader />
                  <main className="p-4 md:p-6 lg:p-8">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </FinancialDataProvider>
          </CurrencyProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
