
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!auth) {
      setError('Authentication service is not available.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('A password reset link has been sent to your email address. Please check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('No user found with this email address. Please check the email and try again.');
      } else {
        console.error('Password Reset error:', err);
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
           <div className="grid gap-2 text-center">
             <div className="flex justify-center mb-4">
                <Logo />
            </div>
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to receive a password reset link.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
             <Alert variant="default" className="border-green-500 text-green-700 dark:text-green-400 [&>svg]:text-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordReset} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!success}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !!success}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

           <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
     <div className="hidden bg-muted lg:block">
             <Image
               src="/unipod.jpg"
               alt="Image"
               width="1920"
               height="1080"
               data-ai-hint="university campus"
               className="h-full w-full object-cover dark:brightness-[0.5] dark:grayscale"
             />
      </div>
    </div>
  );
}
