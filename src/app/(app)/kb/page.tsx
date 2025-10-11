
'use client';
import { BookOpen } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { KnowledgeBaseArticle } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function KnowledgeBasePage() {
  const firestore = useFirestore();
  const articlesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'knowledge_base_articles'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: knowledgeBaseArticles, isLoading } = useCollection<KnowledgeBaseArticle>(articlesQuery);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-12">
          <div className="space-y-2 border-b pb-4">
            <h1 className="font-headline flex items-center gap-3 text-3xl font-bold tracking-tighter">
              <BookOpen className="h-8 w-8 text-primary" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Find official guides, tutorials, and verified information from the
              MUBAS administration.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)
            )}
            {knowledgeBaseArticles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {!isLoading && knowledgeBaseArticles?.length === 0 && (
             <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">No Articles Found</h2>
                <p className="mt-2 text-center text-muted-foreground">
                    There are no articles in the knowledge base yet.
                    An administrator can add new content from the admin dashboard.
                </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
