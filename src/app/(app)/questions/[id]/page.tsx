'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowBigUp, Eye, MessageCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnswerSection from '@/components/answer-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useDoc, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError, useDoc_DEPRECATED } from '@/firebase';
import { doc, updateDoc, increment, runTransaction, collection, serverTimestamp, Timestamp, arrayUnion, addDoc } from 'firebase/firestore';
import { CommunityQuestion, QuestionAnswer, UserProfile, Notification } from '@/lib/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ClientOnlyDate from '@/components/client-only-date';
import { cn } from '@/lib/utils';


export const dynamic = 'force-dynamic';

const answerSchema = z.object({
  answer: z.string().min(20, 'Answer must be at least 20 characters long.'),
});

function QuestionPageSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl py-12">
            <div className="animate-pulse space-y-4">
                <Skeleton className="h-10 w-3/4 rounded bg-muted" />
                <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                    <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <Separator className="my-8" />
                <div className="space-y-4">
                    <Skeleton className="h-5 w-full rounded bg-muted" />
                    <Skeleton className="h-5 w-5/6 rounded bg-muted" />
                    <Skeleton className="h-5 w-3/4 rounded bg-muted" />
                </div>
                 <div className="mt-8 flex items-center justify-between">
                    <Skeleton className="h-9 w-32 rounded-md bg-muted" />
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                        <Skeleton className="h-12 w-12 rounded-full bg-muted-foreground/20" />
                        <div className='space-y-2'>
                           <Skeleton className="h-4 w-24 rounded bg-muted-foreground/20" />
                           <Skeleton className="h-5 w-16 rounded bg-muted-foreground/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function QuestionPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const viewIncrementedRef = useRef(false);

  const questionRef = useMemoFirebase(() => firestore ? doc(firestore, 'questions', id) : null, [firestore, id]);
  const { data: question, isLoading: isQuestionLoading, error } = useDoc<CommunityQuestion>(questionRef);
  
  const userProfileRef = useMemoFirebase(() => (firestore && user?.uid) ? doc(firestore, 'users', user.uid) : null, [firestore, user?.uid]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = user?.email === 'dante@gmail.com';
  
  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  useEffect(() => {
    // Only increment view count if user is loaded and logged in
    if (firestore && id && user && !isUserLoading && !viewIncrementedRef.current) {
        const questionDocRef = doc(firestore, 'questions', id);
        const updateData = { views: increment(1) };
        updateDoc(questionDocRef, updateData)
            .catch(error => {
                if (error.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: questionDocRef.path,
                        operation: 'update',
                        requestResourceData: updateData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                }
            });
        viewIncrementedRef.current = true; // Set flag to prevent future increments in this session
    }
  }, [id, firestore, user, isUserLoading]);

  async function handleUpvote() {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Not logged in",
            description: "You must be logged in to vote.",
        });
        return;
    }
    if (!questionRef || !question) return;

    if (question.authorId === user.uid) {
        toast({ variant: 'destructive', title: 'Cannot upvote your own question.' });
        return;
    }
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const questionDoc = await transaction.get(questionRef);
            if (!questionDoc.exists()) throw "Question not found";

            const upvotedBy = questionDoc.data().upvotedBy || [];
            if (upvotedBy.includes(user.uid)) {
                toast({ variant: 'destructive', title: 'Already Upvoted' });
                return;
            }

            transaction.update(questionRef, { 
                votes: increment(1),
                upvotedBy: arrayUnion(user.uid) 
            });

            // Create notification for the question author
            const notificationData: Omit<Notification, 'id'> = {
                userId: question.authorId,
                actorId: user.uid,
                actorName: userProfile.fullName,
                actorAvatar: userProfile.avatarUrl,
                type: 'question_upvote',
                questionTitle: question.title,
                relatedItemId: question.id,
                createdAt: serverTimestamp(),
                isRead: false,
            };
            const notificationRef = doc(collection(firestore, `users/${question.authorId}/notifications`));
            transaction.set(notificationRef, notificationData);
        });
    } catch(e) {
        // ... error handling
    }
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
        upvotedBy: [],
        approved: isAdmin, // Admins' answers are auto-approved
    };
    
    try {
        const newAnswerRef = doc(collection(firestore, `questions/${question.id}/answers`));

        await runTransaction(firestore, async (transaction) => {
            transaction.set(newAnswerRef, {
                ...answerData,
                createdAt: serverTimestamp()
            });

            const questionDocRef = doc(firestore, 'questions', question.id);
            transaction.update(questionDocRef, {
                answersCount: increment(1)
            });

            // Notify question author (if they aren't the one answering)
            if (question.authorId !== user.uid) {
                const notificationData: Omit<Notification, 'id'> = {
                    userId: question.authorId,
                    actorId: user.uid,
                    actorName: userProfile.fullName,
                    actorAvatar: userProfile.avatarUrl,
                    type: 'new_answer',
                    questionTitle: question.title,
                    relatedItemId: question.id,
                    createdAt: serverTimestamp(),
                    isRead: false,
                };
                const notificationRef = doc(collection(firestore, `users/${question.authorId}/notifications`));
                transaction.set(notificationRef, notificationData);
            }
             // If answer is not auto-approved, notify admin
            if (!isAdmin) {
                const adminId = 'AAXL7PXM5eNkUQ3CabRFvYAthAe2'; // Hardcoded Admin ID
                const adminNotificationData: Omit<Notification, 'id'> = {
                    userId: adminId,
                    actorId: user.uid,
                    actorName: userProfile.fullName,
                    actorAvatar: userProfile.avatarUrl,
                    type: 'new_answer', // Re-use for moderation queue
                    questionTitle: `New answer on: "${question.title}"`,
                    relatedItemId: newAnswerRef.id, // Link to the answer
                    createdAt: serverTimestamp(),
                    isRead: false,
                };
                 const adminNotificationRef = doc(collection(firestore, `users/${adminId}/notifications`));
                 transaction.set(adminNotificationRef, adminNotificationData);
            }
        });

        toast({
            title: "Answer Submitted!",
            description: isAdmin ? "Your answer has been posted." : "Your answer has been submitted for approval.",
        });
        form.reset();

    } catch (error: any) {
        if (error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: `questions/${question.id}/answers`,
                operation: 'create',
                requestResourceData: answerData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "Could not submit your answer.",
            });
        }
    }
  }
  
  const isLoading = isQuestionLoading || isUserLoading || isProfileLoading;
  const hasUpvoted = user && question?.upvotedBy?.includes(user.uid);

  if (error) {
    // Handle error state, maybe show an error message
    notFound();
  }

  if (!isLoading && (question?.isFlagged && !isAdmin)) {
    notFound();
  }

  // Fallback to notFound if loading is finished but there's no question
  if (!isLoading && !question) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {isLoading || !question ? (
          <QuestionPageSkeleton />
        ) : (
          <div className="container mx-auto max-w-4xl py-12">
            <div className="space-y-4">
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                {question.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Asked on <ClientOnlyDate date={question.createdAt} formatString="MMM d, yyyy" />
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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleUpvote} 
                        disabled={!user || hasUpvoted}
                        className={cn(hasUpvoted && "bg-primary/10 text-primary")}
                    >
                      <ArrowBigUp className="mr-2 h-4 w-4" /> Upvote ({question.votes})
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    {question.author ? (
                        <>
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={question.author.avatarUrl}
                                    alt={question.author.name}
                                />
                                <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Asked by</p>
                                <a
                                    href={`/profile?userId=${question.author.id}`}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {question.author.name}
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            <Avatar className="h-12 w-12">
                                <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Asked by</p>
                                <p className="font-semibold">Unknown User</p>
                            </div>
                        </>
                    )}
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
                              You must be <a href={`/login?redirect=/questions/${id}`} className="underline text-primary">logged in</a> to post an answer.
                          </p>
                        )}
                      </form>
                    </Form>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
