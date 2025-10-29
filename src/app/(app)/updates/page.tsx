
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rss } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import ClientOnlyDate from '@/components/client-only-date';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { LiveUpdate } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { WithId } from '@/firebase/firestore/use-collection';

export default function UpdatesPage() {
  const firestore = useFirestore();
  const [liveUpdates, setLiveUpdates] = useState<WithId<LiveUpdate>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updatesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'live_updates'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );

  const { data, isLoading: collectionIsLoading } = useCollection<LiveUpdate>(updatesQuery);

  useEffect(() => {
    if (!collectionIsLoading) {
      setLiveUpdates(data);
      setIsLoading(false);
    }
  }, [data, collectionIsLoading]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              <Rss className="h-8 w-8 text-primary" />
              Live Updates
            </h1>
            <p className="text-muted-foreground">
              The latest announcements and important information from the MUBAS
              administration.
            </p>
          </div>

          <div className="mt-10 grid gap-8">
            {isLoading && (
               Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-primary">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
               ))
            )}
            {liveUpdates?.map((update) => (
              <Card key={update.id} className="border-l-4 border-primary">
                <CardHeader>
                  <CardTitle>{update.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge
                      variant={
                        update.category === 'Maintenance' ? 'destructive'
                        : update.category === 'Academics' ? 'default'
                        : 'secondary'
                      }
                    >
                      {update.category}
                    </Badge>
                    <ClientOnlyDate date={update.createdAt} formatString="MMMM d, yyyy" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{update.content}</p>
                </CardContent>
              </Card>
            ))}
             {!isLoading && liveUpdates?.length === 0 && (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <Rss className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">No Live Updates Yet</h2>
                    <p className="mt-2 text-center text-muted-foreground">
                        Check back later for the latest announcements.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
