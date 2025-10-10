'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../logo';
import { ThemeToggle } from '../theme-toggle';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

interface MobileNavProps {
    setOpen: (open: boolean) => void;
}

export function MobileNav({setOpen}: MobileNavProps) {
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/kb', label: 'Knowledge Base' },
    { href: '/forum', label: 'Forum' },
    isAdmin 
      ? { href: '/admin/content/new', label: 'Post Content' }
      : { href: '/ask', label: 'Ask a Question' }
  ];

  return (
    <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b pb-4 pr-6">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                <Logo />
            </Link>
            <ThemeToggle />
        </div>
        <nav className="mt-8 flex flex-col space-y-4 pr-6">
            {navItems.map((item) => (
                 <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'rounded-md p-2 text-lg font-medium transition-colors hover:bg-muted',
                        pathname === item.href ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                    onClick={() => setOpen(false)}
                    >
                    {item.label}
                 </Link>
            ))}
        </nav>
    </div>
  );
}
