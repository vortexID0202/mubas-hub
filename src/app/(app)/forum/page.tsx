
'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Frown, MessageSquare, Filter, Loader2, CheckCircle } from 'lucide-react';
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
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { CommunityQuestion, Tag } from '@/lib/types';
import { collection, query, orderBy, where, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { sampleTags } from '@/lib/data';

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
            <Skeleton className="h-10 w-full md:w-96 mb-8" />
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
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState('recent');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';

  const buildQuery = useCallback(() => {
    if (!firestore) return null;

    let q = query(collection(firestore, 'questions'));
    
    if (selectedTag) {
      q = query(q, where('tags', 'array-contains', selectedTag));
    }
    
    switch (activeFilter) {
      case 'popular':
        q = query(q, orderBy('votes', 'desc'));
        break;
      case 'unanswered':
        q = query(q, where('answersCount', '==', 0), orderBy('createdAt', 'desc'));
        break;
      case 'verified':
        // We will fetch by recent and filter on the client to avoid composite index
        q = query(q, orderBy('createdAt', 'desc'));
        break;
      case 'recent':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    return q;
  }, [firestore, selectedTag, activeFilter]);
  
  const fetchQuestions = useCallback(async (initial = false) => {
    const q = buildQuery();
    if (!q) return;

    if (initial) {
      setIsLoading(true);
      setQuestions([]);
      setLastDoc(null);
    } else {
      setIsLoadingMore(true);
    }

    let queryToRun = query(q, limit(QUESTIONS_PER_PAGE));
    
    if (!initial && lastDoc) {
      queryToRun = query(queryToRun, startAfter(lastDoc));
    }

    try {
      const documentSnapshots = await getDocs(queryToRun);
      const newQuestions = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityQuestion));
      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      setQuestions(prev => initial ? newQuestions : [...prev, ...newQuestions]);
      setLastDoc(lastVisible);
      setHasMore(documentSnapshots.docs.length === QUESTIONS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildQuery, lastDoc]);
  
  useEffect(() => {
    fetchQuestions(true);
  }, [activeFilter, selectedTag]);

  const handleTagSelect = (tag: Tag | null) => {
    setSelectedTag(tag);
  };
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  }

  const visibleQuestions = useMemo(() => {
    let filtered = isAdmin ? questions : questions.filter(q => !q.isFlagged);
    if (activeFilter === 'verified') {
        filtered = filtered.filter(q => q.isVerified);
    }
    return filtered;
  }, [questions, isAdmin, activeFilter]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    }
    
    if (visibleQuestions.length === 0) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Frown className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">
            No questions found.
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Try adjusting your filters or be the first to ask a question!
          </p>
          <Button asChild className="mt-6">
            <Link href="/ask">Ask a Question</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="flex-1">
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
            {!isAdmin && (
              <Button asChild size="lg">
                <Link href="/ask">Ask a Question</Link>
              </Button>
            )}
          </div>

          <Tabs defaultValue="recent" className="w-full mt-8" onValueChange={handleFilterChange}>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <TabsList className="grid w-full grid-cols-4 md:w-auto">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      {selectedTag ? `Tag: ${selectedTag.name}` : 'Filter by Tag'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleTagSelect(null)}>
                      All Tags
                    </DropdownMenuItem>
                    {sampleTags.map(tag => (
                      <DropdownMenuItem key={tag.id} onSelect={() => handleTagSelect(tag)}>
                        {tag.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-8">
              {renderContent()}
            </div>
          </Tabs>

           {hasMore && (
            <div className="mt-10 text-center">
              <Button onClick={() => fetchQuestions(false)} size="lg" variant="outline" disabled={isLoadingMore}>
                {isLoadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading...</> : 'Load More Questions'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
