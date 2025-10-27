
'use client';
import Link from 'next/link';
import {
  UserProfile,
  CommunityQuestion,
  QuestionAnswer,
} from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  collectionGroup,
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, BookOpen } from 'lucide-react';
import QuestionCard from './question-card';

interface UserProfileDetailsProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
}

function AnswerItem({ answer }: { answer: QuestionAnswer }) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground">{answer.body}</p>
        <div className="mt-2 text-sm text-muted-foreground">
          <span>Answered in response to: </span>
            <Link href={`/questions/${answer.questionId}`} className="text-primary hover:underline">
                View Question
            </Link>
        </div>
      </div>
    );
  }

export function UserProfileDetails({
  userProfile,
  isLoading,
}: UserProfileDetailsProps) {
  const firestore = useFirestore();

  const userQuestionsQuery = useMemoFirebase(
    () =>
      firestore && userProfile
        ? query(
            collection(firestore, 'questions'),
            where('authorId', '==', userProfile.id)
          )
        : null,
    [firestore, userProfile]
  );
  const { data: userQuestions, isLoading: areQuestionsLoading } =
    useCollection<CommunityQuestion>(userQuestionsQuery);

  const userAnswersQuery = useMemoFirebase(
    () =>
      firestore && userProfile
        ? query(
            collectionGroup(firestore, 'answers'),
            where('authorId', '==', userProfile.id)
          )
        : null,
    [firestore, userProfile]
  );
  const { data: userAnswers, isLoading: areAnswersLoading } =
    useCollection<QuestionAnswer>(userAnswersQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-1 h-4 w-1/2" />
              <Skeleton className="mt-4 h-8 w-1/3" />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Skeleton className="mb-4 h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <p>User not found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
      <div className="md:col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Avatar className="h-32 w-32 border-4 border-primary">
              <AvatarImage
                src={userProfile.avatarUrl}
                alt={userProfile.fullName}
              />
              <AvatarFallback className="text-4xl">
                {userProfile.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-center font-headline text-2xl font-bold">
              {userProfile.fullName}
            </h1>
            <p className="mt-1 text-center text-muted-foreground">
              {userProfile.email}
            </p>
            <div className="mt-4 w-full text-center">
              <p className="text-lg font-bold text-primary">
                {userProfile.reputation}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  Reputation
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList>
            <TabsTrigger value="questions">
              <MessageSquare className="mr-2 h-4 w-4" /> Questions (
              {areQuestionsLoading ? '...' : userQuestions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="answers">
              <BookOpen className="mr-2 h-4 w-4" /> Answers (
              {areAnswersLoading ? '...' : userAnswers?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="questions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions Asked</CardTitle>
                <CardDescription>
                  Questions this user has posted to the forum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {areQuestionsLoading && <p>Loading questions...</p>}
                {!areQuestionsLoading && userQuestions && userQuestions.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {userQuestions.map((q) => (
                      <QuestionCard key={q.id} question={q} />
                    ))}
                  </div>
                ) : (
                  !areQuestionsLoading && (
                    <p>This user hasn't asked any questions yet.</p>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="answers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Answers Provided</CardTitle>
                <CardDescription>
                  Answers this user has provided in the forum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {areAnswersLoading && <p>Loading answers...</p>}
                {!areAnswersLoading && userAnswers && userAnswers.length > 0 ? (
                  <div className="space-y-4">
                    {userAnswers.map((answer) => (
                      <AnswerItem key={answer.id} answer={answer} />
                    ))}
                  </div>
                ) : (
                  !areAnswersLoading && (
                    <p>This user hasn't answered any questions yet.</p>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
