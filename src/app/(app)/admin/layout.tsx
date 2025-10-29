
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookCopy,
  Download,
  FileText,
  Home,
  LineChart,
  Menu,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserProfileNav } from '@/components/user-profile-nav';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, collection } from 'firebase/firestore';
import { CommunityQuestion, QuestionAnswer } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const firestore = useFirestore();

  const unapprovedAnswersQuery = useMemoFirebase(
    () => firestore ? query(collectionGroup(firestore, 'answers'), where('approved', '==', false)) : null,
    [firestore]
  );
  const { data: unapprovedAnswers } = useCollection<QuestionAnswer>(unapprovedAnswersQuery);

  const flaggedQuestionsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'questions'), where('isFlagged', '==', true)) : null,
    [firestore]
  );
  const { data: flaggedQuestions } = useCollection<CommunityQuestion>(flaggedQuestionsQuery);
  
  const moderationCount = (unapprovedAnswers?.length ?? 0) + (flaggedQuestions?.length ?? 0);

  const navItems = [
    { href: '/admin', icon: LineChart, label: 'Overview' },
    { href: '/admin/content', icon: BookCopy, label: 'Content' },
    { href: '/admin/moderation', icon: ShieldAlert, label: 'Moderation', badge: moderationCount },
    { href: '/admin/users', icon: Users, label: 'Users' },
  ];

  const systemNavItems = [
    { href: '/admin/system/logs', icon: FileText, label: 'Logs' },
    { href: '/admin/system/reports', icon: Download, label: 'Reports' },
    { href: '/admin/system/security', icon: Shield, label: 'Security' },
  ]

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Home className="h-6 w-6" />
              <span className="">MUBAS Hub Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && item.badge > 0 ? (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              ))}
            </nav>
            <div className="my-4 px-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</h3>
            </div>
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
               {systemNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Contact support for any issues with the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetTitle className="sr-only">Admin Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Admin navigation menu for mobile
              </SheetDescription>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Home className="h-6 w-6" />
                  <span>MUBAS Hub</span>
                </Link>
                {navItems.map((item) => (
                   <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                      pathname === item.href && 'bg-muted text-foreground'
                      )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    {item.badge && item.badge > 0 ? (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                ))}
              </nav>
               <div className="my-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4">System</h3>
              </div>
               <nav className="grid gap-2 text-lg font-medium">
                {systemNavItems.map((item) => (
                     <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                        pathname === item.href && 'bg-muted text-foreground'
                        )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* You can add a search bar here if needed */}
          </div>
          <UserProfileNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
