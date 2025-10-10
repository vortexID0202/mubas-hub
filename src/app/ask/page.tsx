
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Info, Send, AlertCircle, Loader2, BookOpen, Lightbulb } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { CommunityQuestion, Tag, UserProfile } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { getKnowledgeBaseSuggestions } from '@/app/actions';
import { debounce } from '@/lib/utils';
import type { KnowledgeBaseSuggesterOutput } from '@/ai/flows/knowledge-base-suggester';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  details: z.string().min(20, 'Details must be at least 20 characters long.'),
  tags: z.string().refine(value => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    return tags.length > 0 && tags.length <= 5;
  }, 'Please provide 1 to 5 tags, separated by commas.'),
});

export default function AskQuestionPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<KnowledgeBaseSuggesterOutput['suggestions']>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

  const userProfileRef = useMemoFirebase(() => (firestore && user?.uid) ? doc(firestore, 'users', user.uid) : null, [firestore, user?.uid]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      details: '',
      tags: '',
    },
  });
  
  const { isSubmitting, watch } = form.formState;
  const titleValue = watch('title');

  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 15) {
        setSuggestions([]);
        return;
      }
      setIsSuggestionLoading(true);
      try {
        const result = await getKnowledgeBaseSuggestions({ query });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSuggestionLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(titleValue);
  }, [titleValue, debouncedGetSuggestions]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/ask');
    }
  }, [user, isUserLoading, router]);

  async function handleFormSubmit(values: z.infer<typeof questionSchema>) {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in and have a user profile to post a question.",
        });
        return;
    }
    
    const tags: Tag[] = values.tags 
        ? values.tags.split(',').map(tag => ({ id: tag.trim(), name: tag.trim() }))
        : [];
        
    const questionData: Omit<CommunityQuestion, 'id'> = {
        title: values.title,
        body: values.details,
        authorId: user.uid,
        author: { // Denormalize author data
          id: user.uid,
          name: userProfile.fullName,
          avatarUrl: userProfile.avatarUrl,
          reputation: userProfile.reputation
        },
        tags: tags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        votes: 0,
        answersCount: 0,
        views: 0,
    };

    try {
        const questionsCollection = collection(firestore, `questions`);
        await addDoc(questionsCollection, questionData);

        toast({
            title: "Question Posted!",
            description: "Your question is now live in the community forum.",
        });

        router.push('/forum');

    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'questions',
                operation: 'create',
                requestResourceData: questionData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error submitting question to Firestore:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "Failed to submit question. Please try again.",
            });
        }
    }
  }

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-2 text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Ask a Public Question
            </h1>
            <p className="text-muted-foreground">
              Get help from the MUBAS community.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Question</CardTitle>
                    <CardDescription>
                      Focus on a specific problem and provide enough details for
                      others to help you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Is there a way to connect to campus Wi-Fi on Linux?"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Be specific and imagine you’re asking a question to another person.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isSuggestionLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking for existing answers...</span>
                      </div>
                    )}
                    
                    {suggestions.length > 0 && (
                      <Alert variant="default" className="border-accent bg-accent/5">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <AlertTitle className="text-accent">Already have an answer?</AlertTitle>
                        <AlertDescription className="space-y-3 mt-2">
                           <p>Your question might be answered in our Knowledge Base. Check these articles:</p>
                           <ul className="space-y-2">
                            {suggestions.map(suggestion => (
                              <li key={suggestion.id}>
                                <Link href={`/kb/${suggestion.id}`} target="_blank" className="font-semibold text-primary hover:underline">
                                  <BookOpen className="inline h-4 w-4 mr-2" />
                                  {suggestion.title}
                                </Link>
                                <p className="text-xs text-muted-foreground pl-6">{suggestion.reason}</p>
                              </li>
                            ))}
                           </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Include all the information someone would need to answer your question."
                              className="min-h-[200px]"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. smis, wifi, fees, exams"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                           <FormDescription className="text-xs">
                             Add up to 5 tags to describe what your question is about.
                             Use commas to separate tags.
                           </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
                      ) : (
                        <><Send className="mr-2 h-4 w-4" /> Post Your Question</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
            </div>

            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Writing a good question</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                    <li>Summarize your problem in a one-line title.</li>
                    <li>Describe your problem in more detail.</li>
                    <li>Describe what you tried and what you expected to happen.</li>
                    <li>Review your question and post it to the site.</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
