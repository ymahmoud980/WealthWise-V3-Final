"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  setPersistence, // <--- NEW
  browserSessionPersistence, // <--- NEW
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; 
import { Loader2, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthContextType {
  user: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. FORCE SESSION PERSISTENCE
    // This tells Firebase: "Only keep the user logged in while this Tab is open."
    const setupAuth = async () => {
        await setPersistence(auth, browserSessionPersistence);
        
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    };
    
    setupAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Ensure persistence is set before signing in
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      console.error("Login Failed", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#020817] text-white"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600/20 rounded-full border border-blue-600/20">
                    <Fingerprint className="h-10 w-10 text-blue-500" />
                </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Wealth Navigator</CardTitle>
            <CardDescription className="text-slate-400">Secure Cloud Access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={loginWithGoogle}
              style={{ backgroundColor: "white", color: "black", border: "1px solid #e2e8f0" }}
              className="w-full font-bold h-12 shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 hover:bg-gray-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Sign in with Google
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">Session expires when you close this tab.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}