"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Loader2, Lock, LogIn, Mail, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// --- 1. ENHANCED USER TYPE ---
interface User {
  uid: string;
  email: string;
  displayName?: string; // New
  photoURL?: string;    // New
  role?: string;        // New
  lastLogin?: string;   // New
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("wealth_navigator_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- 2. UPGRADED LOGIN LOGIC ---
  const login = (email: string) => {
    const now = new Date();
    
    // Create a "Rich" User Profile
    const newUser: User = { 
        uid: "user_v3_main", 
        email, 
        displayName: email.split('@')[0], // Use part of email as name
        role: 'Pro Investor',             // Default Role
        lastLogin: now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}),
        // Generates a consistent, unique avatar based on the email
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}&backgroundColor=b6e3f4` 
    };
    
    setUser(newUser);
    localStorage.setItem("wealth_navigator_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wealth_navigator_user");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
        setError("Please enter username and password.");
        return;
    }
    login(emailInput);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020817] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/20 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                    <Fingerprint className="h-10 w-10 text-primary" />
                </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">Wealth Navigator <span className="text-primary">Pro</span></CardTitle>
            <CardDescription className="text-center text-slate-400">
              Secure Access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                    type="text" 
                    placeholder="Identity / Email" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                    type="password" 
                    placeholder="Passkey" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50"
                    />
                </div>
              </div>
              {error && <p className="text-sm text-red-400 text-center bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-10 shadow-lg shadow-blue-500/20">
                <LogIn className="mr-2 h-4 w-4" /> Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}