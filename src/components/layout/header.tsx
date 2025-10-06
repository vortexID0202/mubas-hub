
'use client';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import Logo from '@/components/logo';
import { UserProfileNav } from '@/components/user-profile-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SearchBar from '../search-bar';
import { MobileNav } from './mobile-nav';
import { useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Home
            </Link>
            <Link
              href="/#knowledge"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Knowledge Base
            </Link>
            <Link
              href="/#forum"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Forum
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav setOpen={setOpen} />
          </SheetContent>
        </Sheet>
        
        <div className="flex w-full items-center gap-4 md:w-auto md:flex-1 md:justify-center">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
                <SearchBar />
            </div>
        </div>

        <div className="flex flex-none items-center justify-end space-x-2 md:space-x-4">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/ask">Ask Question</Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserProfileNav />
        </div>
      </div>
    </header>
  );
}
