import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, MessageCircle, Eye } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface QuestionCardProps {
  question: CommunityQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link href={`/questions/${question.id}`} className="block">
      <Card className="flex h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4 border-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={question.author.avatarUrl}
                      alt={question.author.name}
                    />
                    <AvatarFallback>
                      {question.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{question.author.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowBigUp className="h-4 w-4" />
                <span>{question.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answersCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg font-semibold leading-snug">
            {question.title}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2 text-sm">
            {question.body}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Asked{' '}
            {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
