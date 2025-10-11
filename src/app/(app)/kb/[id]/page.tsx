
'use client';

import { notFound, useParams } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  LucideProps,
  Landmark,
  Wifi,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import ClientOnlyDate from '@/components/client-only-date';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { KnowledgeBaseArticle } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Wifi: Wifi,
  Landmark: Landmark,
  BookOpen: BookOpen,
};

function ArticlePageSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
            <Skeleton className="h-8 w-48 mb-6" />
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-3/4 mt-4" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function KnowledgeBaseArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const articleRef = useMemoFirebase(() => firestore ? doc(firestore, 'knowledge_base_articles', id) : null, [firestore, id]);
  const { data: article, isLoading } = useDoc<KnowledgeBaseArticle>(articleRef);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1">
            <ArticlePageSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    notFound();
  }

  const Icon = iconMap[article.icon] || BookOpen;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-6">
            <Button variant="link" asChild className="pl-0">
                <Link href="/kb">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Knowledge Base
                </Link>
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                    <Icon className="h-8 w-8 text-accent" />
                    <Badge variant="outline" className="border-accent text-accent text-sm">
                        {article.category}
                    </Badge>
                </div>
                <CardTitle className="pt-4 text-3xl font-bold tracking-tighter sm:text-4xl">
                  {article.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                  <span>
                    Published on{' '}
                    <ClientOnlyDate date={article.createdAt as string} formatString="MMMM d, yyyy" />
                  </span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    <span>Verified by MUBAS</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p>{article.content}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
