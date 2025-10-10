'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  useEffect(() => {
    setPasswordValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    });
  }, [password]);


  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage('Password must be at least 8 characters long, contain one uppercase letter, and one number.');
      return;
    }
    if (!email.endsWith('@mubas.ac.mw')) {
      setErrorMessage('Please use a valid MUBAS email address.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    if (!auth || !firestore) {
      setErrorMessage('Firebase services are not available.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
        photoURL: null,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        fullName: fullName,
        email: user.email,
        avatarUrl: null,
        reputation: 0,
        createdAt: serverTimestamp(),
      });

      router.push('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/email-already-in-use') {
      setErrorMessage(
        'This email address is already in use by another account.'
      );
    } else if (err.code === 'auth/weak-password') {
      setErrorMessage(
        'The password is too weak. Please use at least 8 characters.'
      );
    } else {
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
    console.error('Signup error:', err);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex justify-center mb-4">
              <Logo />
            </Link>
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign Up Failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleManualSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@mubas.ac.mw"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className={cn("flex items-center gap-2", passwordValidations.length ? "text-green-600" : "text-muted-foreground")}>
                  {passwordValidations.length ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span>At least 8 characters long</span>
                </div>
                 <div className={cn("flex items-center gap-2", passwordValidations.uppercase ? "text-green-600" : "text-muted-foreground")}>
                  {passwordValidations.uppercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span>Contains an uppercase letter</span>
                </div>
                 <div className={cn("flex items-center gap-2", passwordValidations.number ? "text-green-600" : "text-muted-foreground")}>
                  {passwordValidations.number ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span>Contains a number</span>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create an account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
              <Image
                src="/signpost.jpg"
                alt="Image"
                width="1920"
                height="1080"
                data-ai-hint="university campus"
                className="h-full w-full object-cover dark:brightness-[0.5] dark:grayscale"
              />
        </div>
    </div>
  );
};

export default SignUpPage;
