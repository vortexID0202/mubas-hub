'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Info, Send, AlertCircle } from 'lucide-react';
import { submitQuestion } from '@/app/actions';

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
import { useUser } from '@/firebase';
import React from 'react';

export default function AskQuestionPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);

  async function handleFormSubmit(formData: FormData) {
    setFormLoading(true);
    setError(null);
    const result = await submitQuestion(formData);
    if (result.success) {
      router.push('/forum');
    } else {
        setError(result.message ?? 'An unknown error occurred.');
    }
    setFormLoading(false);
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    )
  }

  if (!user) {
    router.push('/login?redirect=/ask');
    return null;
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
              <form action={handleFormSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Question</CardTitle>
                    <CardDescription>
                      Focus on a specific problem and provide enough details for
                      others to help you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Is there a way to connect to campus Wi-Fi on Linux?"
                        required
                        disabled={formLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific and imagine you’re asking a question to another
                        person.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="details">Details</Label>
                      <Textarea
                        id="details"
                        name="details"
                        placeholder="Include all the information someone would need to answer your question."
                        className="min-h-[200px]"
                        required
                        disabled={formLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        name="tags"
                        placeholder="e.g. (smis, wifi, fees, exams)"
                        required
                        disabled={formLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Add up to 5 tags to describe what your question is about.
                        Use commas to separate tags.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button type="submit" disabled={formLoading}>
                      <Send className="mr-2 h-4 w-4" /> 
                      {formLoading ? 'Posting...' : 'Post Your Question'}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
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
