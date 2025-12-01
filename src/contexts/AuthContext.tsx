"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
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
    // Listen for connection status
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Failed:", error);
      // Detailed error alert to help debug
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain not authorized! Please go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add this website URL.");
      } else {
        alert(`Login failed: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#020817] text-white"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] p-4">
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
              style={{ backgroundColor: "white", color: "black" }}
              className="w-full font-bold h-12 shadow-lg hover:bg-gray-200 transition-transform active:scale-95"
            >
              Sign in with Google
            </Button>
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