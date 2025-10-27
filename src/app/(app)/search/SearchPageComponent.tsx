
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { hybridSearch } from '@/app/actions';
import type { HybridSearchOutput, HybridSearchInput } from '@/ai/flows/hybrid-search';
import { BookOpen, MessageSquare, Search, ArrowBigUp, CheckCircle2, Frown } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CommunityQuestion, KnowledgeBaseArticle } from '@/lib/types';
import { collection, query } from 'firebase/firestore';

function SearchResultSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded bg-muted" />
            <Skeleton className="h-4 w-1/4 mt-2 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full rounded bg-muted" />
            <Skeleton className="h-4 w-5/6 mt-2 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SearchPageComponent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [results, setResults] = useState<HybridSearchOutput['results']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const firestore = useFirestore();

  const articlesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'knowledge_base_articles')) : null, [firestore]);
  const { data: knowledgeBaseArticles, isLoading: isLoadingArticles } = useCollection<KnowledgeBaseArticle>(articlesQuery);

  const questionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'questions')) : null, [firestore]);
  const { data: questions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);


  useEffect(() => {
    const isDataLoading = isLoadingArticles || isLoadingQuestions;
    if (!queryParam || isDataLoading) {
      if (!isDataLoading) {
        setIsLoading(false);
      }
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allContent: HybridSearchInput['content'] = [];

        knowledgeBaseArticles?.forEach(doc => {
            allContent.push({
                id: doc.id,
                type: 'knowledgeBase' as const,
                title: doc.title,
                content: doc.content,
                isVerified: true,
            });
        });

        questions?.forEach(doc => {
            allContent.push({
                id: doc.id,
                type: 'communityForum' as const,
                title: doc.title,
                content: doc.body,
                isVerified: doc.isVerified || false,
                votes: doc.votes || 0,
                answersCount: doc.answersCount || 0,
            });
        });
        
        const searchResults = await hybridSearch({ query: queryParam, content: allContent });
        setResults(searchResults.results);

      } catch (err) {
        console.error('Search failed:', err);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [queryParam, knowledgeBaseArticles, questions, isLoadingArticles, isLoadingQuestions]);

  const renderContent = () => {
    if (isLoading || isLoadingArticles || isLoadingQuestions) {
      return <SearchResultSkeleton />;
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Frown className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">No Results Found</h2>
            <p className="mt-2 text-center text-muted-foreground">
                We couldn&apos;t find anything matching your search. Try using different keywords.
            </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`}>
             <a href={result.url} className="block hover:bg-muted/50 transition-colors">
                <CardHeader>
                <div className="flex items-center gap-4">
                    {result.type === 'knowledgeBase' ? (
                        <Badge variant="outline" className="border-accent text-accent">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Knowledge Base
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-primary text-primary">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Community Forum
                        </Badge>
                    )}
                     {result.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                           <CheckCircle2 className="mr-2 h-4 w-4" /> Verified
                        </Badge>
                    )}
                </div>
                <CardTitle className="pt-2 text-xl font-semibold">{result.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <CardDescription>{result.description}</CardDescription>
                {result.type === 'communityForum' && (result.votes !== undefined || result.answersCount !== undefined) && (
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <ArrowBigUp className="mr-1 h-4 w-4" />
                            <span>{result.votes ?? 0} votes</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            <span>{result.answersCount ?? 0} answers</span>
                        </div>
                    </div>
                )}
                </CardContent>
            </a>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12">
          <div className="space-y-4 mb-8">
            <h1 className="font-headline flex items-center gap-3 text-3xl font-bold tracking-tighter">
              <Search className="h-8 w-8 text-primary" />
              Search Results
            </h1>
            {queryParam && !isLoading && (
              <p className="text-muted-foreground">
                Showing {results.length} results for &quot;{queryParam}&quot;
              </p>
            )}
          </div>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </>
  );
}
