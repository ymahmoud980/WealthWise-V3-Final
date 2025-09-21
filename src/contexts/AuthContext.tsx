
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmail as firebaseSignIn, 
  signUpWithEmail as firebaseSignUp,
  signOut as firebaseSignOut,
  db,
  doc,
  getDoc,
  type User as FirebaseUser 
} from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

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

const publicRoutes = ['/signin', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/signin');
    }
  }, [user, loading, pathname, router]);


  const handleSignOut = async () => {
    await firebaseSignOut();
    router.push('/signin');
  };
  
  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     )
  }
  
  // Do not render children on protected routes if user is not authenticated
  if (!user && !publicRoutes.includes(pathname)) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithEmail: firebaseSignIn, signUpWithEmail: firebaseSignUp, signOut: handleSignOut }}>
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
