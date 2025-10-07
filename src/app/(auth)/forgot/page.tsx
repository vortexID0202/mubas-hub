'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold">Password Reset</h1>
          <p className="text-balance text-muted-foreground">
            This application uses Google single sign-on. There are no passwords to reset.
          </p>
          <Button asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Login
            </Link>
          </Button>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/mubas-forgot/1920/1080"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="university library"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
