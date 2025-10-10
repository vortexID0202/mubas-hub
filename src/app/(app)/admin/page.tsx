
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
import { users, liveUpdates } from '@/lib/data';
import { Activity, ArrowUpRight, BookOpen, Users, ShieldAlert, FileText, Download, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { CommunityQuestion } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ClientOnlyDate from '@/components/client-only-date';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc'), limit(5)) : null
  , [firestore]);
  const { data: communityQuestions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);

  const totalQuestionsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'questions') : null
  , [firestore]);
  const { data: allQuestions } = useCollection(totalQuestionsQuery);

  const overviewCards = [
    {
      title: 'Total Users',
      icon: Users,
      value: users.length,
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
      value: 3,
      change: '+2 flagged since last hour',
      href: '/admin/moderation'
    },
    {
      title: 'Live Updates',
      icon: Activity,
      value: liveUpdates.length,
      change: '+2 since last week',
      href: '/admin/content'
    }
  ];
  const systemCards = [
     {
      title: 'System Logs',
      icon: FileText,
      value: "2,350",
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
          <CardContent className="grid gap-8">
            {users
              .slice()
              .sort((a, b) => b.reputation - a.reputation)
              .slice(0, 5)
              .map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.id}@mubas.ac.mw
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
