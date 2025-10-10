'use client';
import { useState, useTransition } from 'react';
import { Bot, Sparkles, ThumbsUp } from 'lucide-react';
import { collection, query, orderBy, updateDoc, doc, increment } from 'firebase/firestore';

import { getRankedAnswers } from '@/app/actions';
import { CommunityQuestion, QuestionAnswer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import ClientOnlyDate from './client-only-date';

type AnswerSectionProps = {
  question: CommunityQuestion;
};

export default function AnswerSection({ question }: AnswerSectionProps) {
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const answersQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, `questions/${question.id}/answers`), orderBy('createdAt', 'desc')) : null,
    [firestore, question.id]
  );
  const { data: answers, isLoading: areAnswersLoading } = useCollection<QuestionAnswer>(answersQuery);
  const [sortedAnswers, setSortedAnswers] = useState<QuestionAnswer[] | null>(null);

  const handleRankAnswers = () => {
    if (!answers) return;
    startTransition(async () => {
      const input = {
        question: question.title,
        answers: answers.map((a) => ({
          answerText: a.body,
          upvotes: a.votes,
          comments: a.comments.map((c) => c.body),
        })),
      };
      const rankedAnswers = await getRankedAnswers(input);

      const answerMap = new Map(answers.map((a) => [a.body, a]));
      
      const newSortedAnswers = rankedAnswers
        .map(ranked => answerMap.get(ranked.answerText))
        .filter((a): a is QuestionAnswer => !!a);

      setSortedAnswers(newSortedAnswers);
    });
  };

  const handleAnswerUpvote = (answerId: string) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to vote.',
      });
      return;
    }
    const answerRef = doc(firestore, `questions/${question.id}/answers`, answerId);
    const updateData = { votes: increment(1) };
    
    // Use non-blocking update with chained error handling
    updateDoc(answerRef, updateData)
      .catch((error) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: answerRef.path,
            operation: 'update',
            requestResourceData: {
              votes: `increment(1)`,
            },
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({
            variant: 'destructive',
            title: 'Upvote Failed',
            description: error.message || 'Could not upvote this answer.',
          });
        }
      });
  };

  const displayAnswers = sortedAnswers || answers;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {areAnswersLoading ? '...' : (displayAnswers?.length || 0)}{' '}
          {(displayAnswers?.length || 0) === 1 ? 'Answer' : 'Answers'}
        </h2>
        {displayAnswers && displayAnswers.length > 1 && (
            <Button variant="outline" onClick={handleRankAnswers} disabled={isPending}>
                {isPending ? (
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Rank with AI
            </Button>
        )}
      </div>

      {areAnswersLoading && <p className="mt-6 text-muted-foreground">Loading answers...</p>}

      {!areAnswersLoading && displayAnswers && displayAnswers.length > 0 && (
        <div className="mt-6 space-y-8">
            {displayAnswers.map((answer) => (
            <div key={answer.id} className="flex gap-4">
                <Avatar className="h-10 w-10">
                <AvatarImage
                    src={answer.author.avatarUrl}
                    alt={answer.author.name}
                />
                <AvatarFallback>{answer.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">{answer.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Answered <ClientOnlyDate date={answer.createdAt} formatType="formatDistanceToNow" />
                    </div>
                </div>
                <div className="prose prose-sm mt-2 max-w-none dark:prose-invert">
                    <p>{answer.body}</p>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground" onClick={() => handleAnswerUpvote(answer.id)} disabled={!user}>
                    <ThumbsUp className="h-4 w-4" />
                    <span>{answer.votes}</span>
                    </Button>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {!areAnswersLoading && (!displayAnswers || displayAnswers.length === 0) && (
        <p className="mt-6 text-muted-foreground">
            No answers yet. Be the first to help out!
        </p>
      )}
    </div>
  );
}
