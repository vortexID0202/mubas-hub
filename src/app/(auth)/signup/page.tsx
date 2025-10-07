'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
        photoURL: `https://picsum.photos/seed/${user.uid}/40/40`
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        fullName: fullName,
        email: user.email,
        avatarUrl: user.photoURL,
        reputation: 0,
      });

      router.push('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          fullName: user.displayName,
          email: user.email,
          avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
          reputation: 0,
        });
      }

      router.push('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthError = (err: any) => {
       if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-up process was cancelled.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('An account with this email already exists using a different sign-in method.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email address is already in use by another account.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('The password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/configuration-not-found') {
        setErrorMessage('Authentication method not enabled. Please enable Email/Password and Google sign-in in your Firebase console.');
      }
      else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
      console.error('Signup error:', err);
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to get started
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
              <Input 
                id="full-name" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
           <Separator className="my-2" />
            <Button
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full"
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 8.4 244 8.4c77.9 0 144.3 30.8 192.3 78.6l-69.8 67.2c-23.6-22.5-54.8-36.4-92.5-36.4-69.8 0-127.5 57.8-127.5 128.2s57.7 128.2 127.5 128.2c80.6 0 110-58.2 113.5-87.8H244v-73.6h244z"
                ></path>
              </svg>
              Sign up with Google
            </Button>
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
          src="https://picsum.photos/seed/mubas-signup/1920/1080"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="students collaborating"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
