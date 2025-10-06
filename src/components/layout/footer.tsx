import Link from 'next/link';
import Logo from '@/components/logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <Logo />
          <p className="text-sm text-muted-foreground">
            A place for MUBAS students to find solutions and share knowledge.
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm md:gap-6">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link
            href="/#knowledge"
            className="transition-colors hover:text-primary"
          >
            Knowledge Base
          </Link>
          <Link href="/#forum" className="transition-colors hover:text-primary">
            Forum
          </Link>
          <Link href="/ask" className="transition-colors hover:text-primary">
            Ask a Question
          </Link>
        </nav>
        <div className="text-center text-sm text-muted-foreground md:text-right">
          <p>&copy; {new Date().getFullYear()} MUBAS Community Hub.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
