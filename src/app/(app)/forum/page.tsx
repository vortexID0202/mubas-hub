import Link from 'next/link';
import {
  Frown,
  MessageSquare,
  Filter,
} from 'lucide-react';
import {
  communityQuestions,
} from '@/lib/data';
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

export default function ForumPage() {
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
                 <Button asChild size="lg">
                    <Link href="/ask">Ask a Question</Link>
                </Button>
            </div>
            
          <Tabs defaultValue="recent" className="w-full mt-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="recent">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="popular">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="unanswered">
                 Unanswered
                </TabsTrigger>
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
              {communityQuestions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {communityQuestions.map((question) => (
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
      </main>
      <Footer />
    </>
  );
}
