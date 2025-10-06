'use client';
import { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Sparkles, ThumbsUp } from 'lucide-react';

import { getRankedAnswers } from '@/app/actions';
import { CommunityQuestion, QuestionAnswer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from './ui/separator';

type AnswerSectionProps = {
  question: CommunityQuestion;
};

export default function AnswerSection({ question }: AnswerSectionProps) {
  const [answers, setAnswers] = useState<QuestionAnswer[]>(question.answers);
  const [isPending, startTransition] = useTransition();

  const handleRankAnswers = () => {
    startTransition(async () => {
      const input = {
        question: question.title,
        answers: question.answers.map((a) => ({
          answerText: a.body,
          upvotes: a.votes,
          comments: a.comments.map((c) => c.body),
        })),
      };
      const rankedAnswers = await getRankedAnswers(input);

      // Create a map for quick lookup
      const answerMap = new Map(question.answers.map((a) => [a.body, a]));
      
      const newSortedAnswers = rankedAnswers
        .map(ranked => answerMap.get(ranked.answerText))
        .filter((a): a is QuestionAnswer => !!a);

      setAnswers(newSortedAnswers);
    });
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <Button variant="outline" onClick={handleRankAnswers} disabled={isPending}>
          {isPending ? (
            <Bot className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Rank with AI
        </Button>
      </div>

      <div className="mt-6 space-y-8">
        {answers.map((answer) => (
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
                  Answered{' '}
                  {formatDistanceToNow(new Date(answer.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="prose prose-sm mt-2 max-w-none dark:prose-invert">
                <p>{answer.body}</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{answer.votes}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
