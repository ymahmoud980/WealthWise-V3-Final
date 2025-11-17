

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { UserData } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/signin', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          if (!user) {
            setUserData(null);
            setLoading(false);
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error setting auth persistence:", error);
        setLoading(false);
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      const isPublic = publicRoutes.includes(pathname);
      if (!user && !isPublic) {
        router.push("/signin");
      } else if (user && isPublic) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/signin");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
