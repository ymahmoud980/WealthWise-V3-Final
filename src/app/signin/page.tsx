
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, KeyRound } from 'lucide-react';

export default function SignInPage() {
  const { user, signInAnonymously, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAnonymously();
      // The useEffect will handle the redirect
    } catch (error) {
      console.error("Anonymous sign-in failed", error);
      // Handle error, maybe show a toast
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading || user) {
      return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <KeyRound className="h-8 w-8" />
             </div>
          </div>
          <CardTitle>Welcome to Wealth Navigator</CardTitle>
          <CardDescription>
            Sign in anonymously to securely access and sync your financial data across devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full">
            {isSigningIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSigningIn ? 'Securing your session...' : 'Sign In Anonymously'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
