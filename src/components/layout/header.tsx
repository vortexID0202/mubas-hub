'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Pencil, PlusSquare } from 'lucide-react';
import Logo from '@/components/logo';
import { UserProfileNav } from '@/components/user-profile-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import SearchBar from '../search-bar';
import { MobileNav } from './mobile-nav';
import { useState } from 'react';
import { ThemeToggle } from '../theme-toggle';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import NotificationsPopover from '../notifications-popover';

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/kb', label: 'Knowledge Base' },
    { href: '/forum', label: 'Forum' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
               <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
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
             <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
             <SheetDescription className="sr-only">
               Main navigation menu for mobile devices.
             </SheetDescription>
            <MobileNav setOpen={setOpen} />
          </SheetContent>
        </Sheet>
        
        <div className="flex w-full items-center gap-4 md:w-auto md:flex-1 md:justify-center">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
                <SearchBar />
            </div>
        </div>

        <div className="flex flex-none items-center justify-end space-x-2 pl-4 md:space-x-4">
          {isAdmin ? (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/admin/content/new">
                 <PlusSquare className="mr-2 h-4 w-4" />
                Post Content
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/ask">Ask Question</Link>
            </Button>
          )}
          <NotificationsPopover />
          <ThemeToggle />
          <UserProfileNav />
        </div>
      </div>
    </header>
  );
}
