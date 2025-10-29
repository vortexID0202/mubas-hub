
'use client';
import Link from 'next/link';
import Logo from '@/components/logo';
import { useUser } from '@/firebase';
import { Facebook, Linkedin, Youtube } from 'lucide-react';

const XIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

export function Footer() {
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';

  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-10 md:flex-row md:gap-12">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            A place for MUBAS students to find solutions and share knowledge.
          </p>
           <div className="mt-2 text-center text-sm text-muted-foreground md:text-left">
              <p>&copy; {new Date().getFullYear()} MUBAS Community Hub.</p>
              <p>All rights reserved.</p>
            </div>
        </div>
        <div className="flex flex-col items-center gap-8 md:items-start">
             <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium md:gap-6">
                <Link href="/" className="transition-colors hover:text-primary">
                    Home
                </Link>
                <Link
                    href="/kb"
                    className="transition-colors hover:text-primary"
                >
                    Knowledge Base
                </Link>
                <Link href="/forum" className="transition-colors hover:text-primary">
                    Forum
                </Link>
                 <Link href="/about" className="transition-colors hover:text-primary">
                    About
                </Link>
                {isAdmin ? (
                    <Link href="/admin/content/new" className="transition-colors hover:text-primary">
                        Post Content
                    </Link>
                ) : (
                    <Link href="/ask" className="transition-colors hover:text-primary">
                        Ask a Question
                    </Link>
                )}
            </nav>
            <div className="flex items-center justify-center gap-5">
                <a href="https://x.com/mubas_mw" target="_blank" rel="noopener noreferrer" aria-label="X page for MUBAS" className="text-muted-foreground transition-colors hover:text-foreground">
                    <XIcon className="h-5 w-5" />
                </a>
                 <a href="https://www.facebook.com/mubasmw" target="_blank" rel="noopener noreferrer" aria-label="Facebook page for MUBAS" className="text-muted-foreground transition-colors hover:text-foreground">
                    <Facebook className="h-6 w-6" />
                </a>
                 <a href="https://www.linkedin.com/school/mubas" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn page for MUBAS" className="text-muted-foreground transition-colors hover:text-foreground">
                    <Linkedin className="h-6 w-6" />
                </a>
                <a href="https://www.youtube.com/@mubasmw" target="_blank" rel="noopener noreferrer" aria-label="YouTube channel for MUBAS" className="text-muted-foreground transition-colors hover:text-foreground">
                    <Youtube className="h-6 w-6" />
                </a>
            </div>
        </div>
      </div>
    </footer>
  );
}
