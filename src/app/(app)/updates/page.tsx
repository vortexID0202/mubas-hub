import { liveUpdates } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rss } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function UpdatesPage() {
  const sortedUpdates = [...liveUpdates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
            {sortedUpdates.map((update) => (
              <Card key={update.id} className="border-l-4 border-primary">
                <CardHeader>
                  <CardTitle>{update.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge
                      variant={
                        update.category === 'Maintenance'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {update.category}
                    </Badge>
                    <span>
                      {format(new Date(update.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{update.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
