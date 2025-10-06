import { BookOpen } from 'lucide-react';

import { knowledgeBaseArticles } from '@/lib/data';
import ArticleCard from '@/components/article-card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function KnowledgeBasePage() {
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
            {knowledgeBaseArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
