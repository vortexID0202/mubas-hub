'use client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowBigUp, Eye, MessageCircle, User as UserIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnswerSection from '@/components/answer-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { CommunityQuestion, QuestionAnswer, UserProfile } from '@/lib/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const answerSchema = z.object({
  answer: z.string().min(20, 'Answer must be at least 20 characters long.'),
});

function QuestionPageSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl py-12">
            <div className="animate-pulse space-y-4">
                <div className="h-10 w-3/4 rounded bg-muted"></div>
                <div className="h-5 w-1/2 rounded bg-muted"></div>
                <div className="flex gap-2">
                    <div className="h-6 w-20 rounded-full bg-muted"></div>
                    <div className="h-6 w-20 rounded-full bg-muted"></div>
                </div>
                <Separator className="my-8" />
                <div className="space-y-4">
                    <div className="h-5 w-full rounded bg-muted"></div>
                    <div className="h-5 w-5/6 rounded bg-muted"></div>
                    <div className="h-5 w-3/4 rounded bg-muted"></div>
                </div>
                 <div className="mt-8 flex items-center justify-between">
                    <div className="h-9 w-32 rounded-md bg-muted"></div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                        <div className="h-12 w-12 rounded-full bg-muted-foreground/20"></div>
                        <div className='space-y-2'>
                           <div className="h-4 w-24 rounded bg-muted-foreground/20"></div>
                           <div className="h-5 w-16 rounded bg-muted-foreground/20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function QuestionPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const questionRef = useMemoFirebase(() => firestore ? doc(firestore, 'questions', params.id) : null, [firestore, params.id]);
  const { data: question, isLoading: isQuestionLoading, error } = useDoc<CommunityQuestion>(questionRef);
  
  const userProfileRef = useMemoFirebase(() => (firestore && user?.uid) ? doc(firestore, 'users', user.uid) : null, [firestore, user?.uid]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  useEffect(() => {
    if (!isQuestionLoading && !question) {
        // Increment view count only when question is loaded and exists
        const incrementViewCount = async () => {
            if(firestore && params.id) {
                const questionDocRef = doc(firestore, 'questions', params.id);
                await updateDoc(questionDocRef, {
                    views: increment(1)
                });
            }
        };
        incrementViewCount().catch(console.error); // Best-effort
    }
  }, [isQuestionLoading, question, params.id, firestore]);

  async function handleUpvote() {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Not logged in",
            description: "You must be logged in to vote.",
        });
        return;
    }
    if (!questionRef) return;
    await updateDoc(questionRef, { votes: increment(1) });
  }

  async function handleAnswerSubmit(values: z.infer<typeof answerSchema>) {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to post an answer.",
        });
        return;
    }

    if (!question) return;

    const answerData: Omit<QuestionAnswer, 'id' | 'createdAt'> = {
        body: values.answer,
        authorId: user.uid,
        questionId: question.id,
        author: {
            id: user.uid,
            name: userProfile.fullName,
            avatarUrl: userProfile.avatarUrl,
            reputation: userProfile.reputation
        },
        votes: 0,
        comments: [],
    };
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const answerColRef = collection(firestore, `questions/${question.id}/answers`);
            transaction.set(doc(answerColRef), {
                ...answerData,
                createdAt: serverTimestamp()
            });

            const questionDocRef = doc(firestore, 'questions', question.id);
            transaction.update(questionDocRef, {
                answersCount: increment(1)
            });
        });

        toast({
            title: "Answer Submitted!",
            description: "Your answer has been posted.",
        });
        form.reset();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "Could not submit your answer.",
        });
    }
  }
  
  const isLoading = isQuestionLoading || isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
     <>
      <Header />
      <main className="flex-1">
          <QuestionPageSkeleton />
      </main>
      <Footer />
     </>
    )
  }

  if (!question) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12">
          <div className="space-y-4">
            <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              {question.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                Asked on {format(question.createdAt instanceof Date ? question.createdAt : (question.createdAt as any).toDate(), 'MMM d, yyyy')}
              </span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{question.views} views</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 gap-12">
            <div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>{question.body}</p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleUpvote} disabled={!user}>
                    <ArrowBigUp className="mr-2 h-4 w-4" /> Upvote ({question.votes})
                  </Button>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={question.author.avatarUrl}
                      alt={question.author.name}
                    />
                    <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Asked by</p>
                    <Link
                      href="/profile"
                      className="font-semibold text-primary hover:underline"
                    >
                      {question.author.name}
                    </Link>
                  </div>
                </div>
              </div>
              
              <AnswerSection question={question} />

              <aside className="mt-12 space-y-6" id="answer-form">
                <div className="rounded-lg bg-primary/5 p-6">
                  <h3 className="text-xl font-semibold text-primary">Post Your Answer</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAnswerSubmit)} className="mt-4 space-y-4">
                       <FormField
                          control={form.control}
                          name="answer"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Type your answer here..."
                                  className="min-h-[150px] bg-background"
                                  {...field}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !user}>
                         {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : "Submit Answer"}
                      </Button>
                      {!user && !isUserLoading && (
                        <p className="text-center text-sm text-muted-foreground">
                            You must be <Link href={`/login?redirect=/questions/${params.id}`} className="underline text-primary">logged in</Link> to post an answer.
                        </p>
                      )}
                    </form>
                  </Form>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
