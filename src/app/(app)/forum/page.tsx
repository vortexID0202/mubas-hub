'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Frown, MessageSquare, Filter, Loader2 } from 'lucide-react';
import QuestionCard from '@/components/question-card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CommunityQuestion, UserProfile } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const QUESTIONS_PER_PAGE = 6;

function ForumPageSkeleton() {
  return (
     <div className="container mx-auto py-12">
        <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <h1 className="font-headline flex items-center gap-3 text-3xl font-bold tracking-tighter">
                <MessageSquare className="h-8 w-8 text-primary" />
                Community Forum
              </h1>
              <p className="text-muted-foreground">
                Ask questions, share solutions, and learn from fellow students.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/ask">Ask a Question</Link>
            </Button>
          </div>
          <div className="mt-8">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
     </div>
  )
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>
        </div>
    )
}


export default function ForumPage() {
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(
    QUESTIONS_PER_PAGE
  );
  const firestore = useFirestore();

  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc')) : null
  , [firestore]);
  const { data: questions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);
  
  const usersQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'users') : null
  , [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  
  const usersMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.id, u]));
  }, [users]);
  
  const enrichedQuestions = useMemo(() => {
    if (!questions || !usersMap.size) return [];
    return questions.map(q => ({
      ...q,
      author: {
        id: q.authorId,
        name: usersMap.get(q.authorId)?.fullName || 'Unknown User',
        avatarUrl: usersMap.get(q.authorId)?.avatarUrl || '',
        reputation: usersMap.get(q.authorId)?.reputation || 0,
      }
    }));
  }, [questions, usersMap]);


  const loadMore = () => {
    setVisibleQuestionsCount((prev) => prev + QUESTIONS_PER_PAGE);
  };

  const questionsToShow = enrichedQuestions.slice(0, visibleQuestionsCount);

  const isLoading = isLoadingQuestions || isLoadingUsers;

  return (
    <>
      <Header />
      <main className="flex-1">
        {isLoading ? (
            <ForumPageSkeleton />
        ) : (
        <div className="container mx-auto py-12">
          <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <h1 className="font-headline flex items-center gap-3 text-3xl font-bold tracking-tighter">
                <MessageSquare className="h-8 w-8 text-primary" />
                Community Forum
              </h1>
              <p className="text-muted-foreground">
                Ask questions, share solutions, and learn from fellow students.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/ask">Ask a Question</Link>
            </Button>
          </div>

          <Tabs defaultValue="recent" className="w-full mt-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
              </TabsList>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter by Tag
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>smis</DropdownMenuItem>
                  <DropdownMenuItem>wifi</DropdownMenuItem>
                  <DropdownMenuItem>fees</DropdownMenuItem>
                  <DropdownMenuItem>exams</DropdownMenuItem>
                  <DropdownMenuItem>academics</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TabsContent value="recent" className="mt-8">
              {questionsToShow.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {questionsToShow.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Frown className="h-16 w-16 text-muted-foreground" />
                  <h2 className="mt-6 text-xl font-semibold">
                    No Questions Yet
                  </h2>
                  <p className="mt-2 text-center text-muted-foreground">
                    Be the first to ask a question and get help from the
                    community.
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/ask">Ask a Question</Link>
                  </Button>
                </div>
              )}
              {visibleQuestionsCount < (questions?.length || 0) && (
                <div className="mt-10 text-center">
                  <Button onClick={loadMore} size="lg" variant="outline" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading...</> : 'Load More Questions'}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-8">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Frown className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">
                  No popular questions at the moment.
                </h2>
                <p className="mt-2 text-center text-muted-foreground">
                  Upvote questions you find helpful to make them popular.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="unanswered" className="mt-8">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Frown className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">
                  No unanswered questions.
                </h2>
                <p className="mt-2 text-center text-muted-foreground">
                  It looks like the community has answered everything!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        )}
      </main>
      <Footer />
    </>
  );
}
