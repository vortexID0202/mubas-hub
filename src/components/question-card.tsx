import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowBigUp,
  MessageCircle,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityQuestion } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface QuestionCardProps {
  question: CommunityQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const topAnswer = question.answers?.sort((a, b) => b.votes - a.votes)[0];
  const isVerified = topAnswer?.isVerified;

  return (
    <Card
      className={cn(
        'flex h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4',
        isVerified ? 'border-green-500' : 'border-primary'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile" className="z-10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={question.author.avatarUrl}
                      alt={question.author.name}
                    />
                    <AvatarFallback>
                      {question.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{question.author.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link href={`/questions/${question.id}`} className="block">
          <CardTitle className="text-lg font-semibold leading-snug transition-colors hover:text-primary">
            {question.title}
          </CardTitle>
        </Link>
        <CardDescription className="mt-2 line-clamp-2 text-sm">
          {question.body}
        </CardDescription>

        {topAnswer && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
               {isVerified && (
                  <div className='flex items-center gap-2 text-sm font-semibold text-green-600'>
                      <Award className="h-5 w-5" />
                      Verified Answer
                  </div>
              )}
              <div className="flex items-start gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/profile" className="z-10">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={topAnswer.author.avatarUrl}
                            alt={topAnswer.author.name}
                          />
                          <AvatarFallback>
                            {topAnswer.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{topAnswer.author.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {topAnswer.body}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowBigUp className="h-4 w-4" />
              <span>{question.votes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answersCount}</span>
            </div>
          </div>
          <Link href={`/questions/${question.id}#answer-form`}>
            <Button variant="outline" size="sm">
              Answer
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Asked{' '}
          {formatDistanceToNow(new Date(question.createdAt), {
            addSuffix: true,
          })}
        </p>
      </CardFooter>
    </Card>
  );
}