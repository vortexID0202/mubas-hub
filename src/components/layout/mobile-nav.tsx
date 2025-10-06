'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '../logo';

interface MobileNavProps {
    setOpen: (open: boolean) => void;
}

export function MobileNav({setOpen}: MobileNavProps) {
  return (
    <div className="flex h-full flex-col">
        <div className="flex items-center border-b pb-4">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                <Logo />
            </Link>
        </div>
        <nav className="mt-8 flex flex-col space-y-4">
            <Link
              href="/"
              className="rounded-md p-2 text-foreground transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/kb"
              className="rounded-md p-2 text-foreground/60 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Knowledge Base
            </Link>
            <Link
              href="/forum"
              className="rounded-md p-2 text-foreground/60 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Forum
            </Link>
             <Link
              href="/ask"
              className="rounded-md p-2 text-foreground/60 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Ask a Question
            </Link>
        </nav>
    </div>
  );
}
