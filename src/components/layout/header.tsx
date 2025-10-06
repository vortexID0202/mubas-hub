import Link from 'next/link';
import { Bell, GraduationCap } from 'lucide-react';

import Logo from '@/components/logo';
import { UserProfileNav } from '@/components/user-profile-nav';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
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
        {/* Mobile Logo */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <Button asChild>
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
