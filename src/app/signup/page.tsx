
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.name);
      toast({
        title: 'Account Created',
        description: "You've been successfully signed up! Redirecting...",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Sign-up Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
       <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-purple-600 to-orange-400 p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Join Wealth Navigator</h1>
          <p className="text-lg text-purple-100">
            Start your journey towards financial clarity. Create an account to begin tracking your portfolio with powerful tools and AI-driven insights.
          </p>
          <div className="mt-8 space-y-4">
             <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                </div>
                <div>
                    <h3 className="font-semibold">Track Everything</h3>
                    <p className="text-sm text-purple-200">From real estate to cash holdings, get a complete view of your assets.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 21v-4"/><path d="M12 3v4"/><path d="M12 11v4"/><path d="M3 13h4"/><path d="M17 13h4"/><path d="M4 7.5h1"/><path d="M19 7.5h1"/><path d="M8.5 18h1"/><path d="M14.5 18h1"/><path d="M8.5 6h1"/><path d="M14.5 6h1"/></svg>
                </div>
                <div>
                    <h3 className="font-semibold">AI-Powered Insights</h3>
                    <p className="text-sm text-purple-200">Leverage AI to get financial advice and generate detailed reports.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center text-gray-500 mb-2">CREATE ACCOUNT</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                 <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    {...form.register('name')}
                  />
              </div>
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                     className="pl-10"
                    {...form.register('email')}
                  />
               </div>
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...form.register('password')}
                  />
               </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SIGN UP
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
