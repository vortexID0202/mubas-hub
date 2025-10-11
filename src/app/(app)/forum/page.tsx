
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { CommunityQuestion, Tag } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
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
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(
    QUESTIONS_PER_PAGE
  );
  const [activeFilter, setActiveFilter] = useState('recent');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';

  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc')) : null
  , [firestore]);
  const { data: questions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);
  
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    let processedQuestions = [...questions];

    // Filter by tag first
    if (selectedTag) {
      processedQuestions = processedQuestions.filter(q => q.tags.some(t => t.name === selectedTag.name));
    }
    
    // Then sort/filter by the active tab
    switch (activeFilter) {
      case 'popular':
        processedQuestions.sort((a, b) => b.votes - a.votes);
        break;
      case 'unanswered':
        processedQuestions = processedQuestions.filter(q => q.answersCount === 0);
        break;
      case 'verified':
        processedQuestions = processedQuestions.filter(q => q.isVerified);
        break;
      case 'recent':
      default:
        // Already sorted by date from the query
        break;
    }

    return processedQuestions;
  }, [questions, activeFilter, selectedTag]);

  const loadMore = () => {
    setVisibleQuestionsCount((prev) => prev + QUESTIONS_PER_PAGE);
  };

  const handleTagSelect = (tag: Tag | null) => {
    setSelectedTag(tag);
    setVisibleQuestionsCount(QUESTIONS_PER_PAGE); // Reset pagination
  };

  const questionsToShow = filteredQuestions.slice(0, visibleQuestionsCount);

  const isLoading = isLoadingQuestions;
  
  const renderContent = () => {
    if (questionsToShow.length > 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {questionsToShow.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      );
    }
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
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {isLoading && !questions ? (
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
            {!isAdmin && (
              <Button asChild size="lg">
                <Link href="/ask">Ask a Question</Link>
              </Button>
            )}
          </div>

          <Tabs defaultValue="recent" className="w-full mt-8" onValueChange={setActiveFilter}>
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
            <TabsContent value="recent" className="mt-8">
              {renderContent()}
            </TabsContent>
            <TabsContent value="popular" className="mt-8">
              {renderContent()}
            </TabsContent>
            <TabsContent value="unanswered" className="mt-8">
              {renderContent()}
            </TabsContent>
            <TabsContent value="verified" className="mt-8">
              {renderContent()}
            </TabsContent>
          </Tabs>

           {visibleQuestionsCount < (filteredQuestions?.length || 0) && (
            <div className="mt-10 text-center">
              <Button onClick={loadMore} size="lg" variant="outline" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading...</> : 'Load More Questions'}
              </Button>
            </div>
          )}
        </div>
        )}
      </main>
      <Footer />
    </>
  );
}
