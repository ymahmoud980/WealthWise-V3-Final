
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmail, 
  signUpWithEmail,
  signOut,
  db,
  doc,
  getDoc,
  type User as FirebaseUser 
} from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data();
          setUserProfile({
            name: profileData.name,
            email: user.email || '',
            role: profileData.role,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };
  
  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     )
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithEmail, signUpWithEmail, signOut: handleSignOut }}>
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
