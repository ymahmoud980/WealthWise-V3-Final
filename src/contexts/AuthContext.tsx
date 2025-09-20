
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously, type User } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
