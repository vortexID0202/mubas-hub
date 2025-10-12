'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, ArrowUpRight, BookOpen, Users, ShieldAlert, FileText, Download, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { CommunityQuestion, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ClientOnlyDate from '@/components/client-only-date';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc'), limit(5)) : null
  , [firestore]);
  const { data: communityQuestions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);

  const totalQuestionsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'questions') : null
  , [firestore]);
  const { data: allQuestions } = useCollection(totalQuestionsQuery);

  const usersQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users') : null
  , [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const flagsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'flags') : null
  , [firestore]);
  const { data: allFlags, isLoading: isLoadingFlags } = useCollection(flagsQuery);

  const totalUsers = allUsers ? allUsers.filter(u => u.id !== currentUser?.uid).length : 0;

  const overviewCards = [
    {
      title: 'Total Users',
      icon: Users,
      value: isLoadingUsers ? '...' : totalUsers,
      change: '+10.1% from last month',
      href: '/admin/users'
    },
    {
      title: 'Total Questions',
      icon: BookOpen,
      value: allQuestions?.length ?? '...',
      change: '+12.2% from last month',
      href: '/forum'
    },
    {
      title: 'Pending Moderation',
      icon: ShieldAlert,
      value: isLoadingFlags ? '...' : allFlags?.length ?? 0,
      change: '+2 flagged since last hour',
      href: '/admin/moderation'
    },
    {
      title: 'Live Updates',
      icon: Activity,
      value: '...', // Static for now
      change: '+2 since last week',
      href: '/admin/content'
    }
  ];
  const systemCards = [
     {
      title: 'System Logs',
      icon: FileText,
      value: "...",
      change: 'View system activity',
      href: '/admin/system/logs'
    },
     {
      title: 'Reports',
      icon: Download,
      value: "Download",
      change: 'Generate system reports',
      href: '/admin/system/reports'
    },
     {
      title: 'Security',
      icon: Shield,
      value: "Healthy",
      change: 'Monitor system security',
      href: '/admin/system/security'
    }
  ];

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">System Overview</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-4 border-t pt-8">
        <h2 className="text-lg font-semibold md:text-xl mb-4">System Health</h2>
         <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {systemCards.map((card) => (
              <Link href={card.href} key={card.title}>
                <Card className="hover:bg-muted/50 transition-colors col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {card.change}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Questions</CardTitle>
              <CardDescription>
                A list of the most recent questions from the community.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingQuestions && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32 mt-1" />
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                )}
                {communityQuestions?.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <div className="font-medium">{q.author?.name || 'Unknown User'}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {q.author?.id ? `${q.author.id}@mubas.ac.mw` : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                        <Link href={`/questions/${q.id}`} className="hover:underline">
                            {q.title}
                        </Link>
                    </TableCell>
                    <TableCell className="text-right">
                       <ClientOnlyDate date={q.createdAt as string} formatString="P" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {isLoadingUsers && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="grid gap-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))
            )}
            {allUsers && allUsers
              .slice()
              .sort((a, b) => b.reputation - a.reputation)
              .slice(0, 5)
              .map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{user.reputation} pts</div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
