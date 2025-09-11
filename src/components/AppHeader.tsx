
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrency } from "@/hooks/use-currency";
import type { Currency } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/assets": "Asset Tracking",
  "/liabilities": "Liability Tracking",
  "/cashflow": "Cash Flow Management",
  "/advisor": "AI Financial Advisor",
  "/insights": "AI Document Insights",
  "/calculator": "Currency Calculator",
  "/breakdown": "Calculation Breakdown",
  "/health": "Financial Health Analysis",
  "/login": "Login",
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const title = pageTitles[pathname] || "Wealth Navigator";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>

      <div className="ml-auto flex items-center gap-4">
        <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EGP">EGP</SelectItem>
            <SelectItem value="KWD">KWD</SelectItem>
            <SelectItem value="TRY">TRY</SelectItem>
          </SelectContent>
        </Select>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || "https://picsum.photos/100"} alt="User" data-ai-hint="profile picture" />
                  <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile</DropdownMenuItem>
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
           pathname !== '/login' && <Button asChild><Link href="/login">Login</Link></Button>
        )}
      </div>
    </header>
  );
}
