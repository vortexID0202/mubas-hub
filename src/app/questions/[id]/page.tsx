import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowBigUp, Eye, MessageCircle, User as UserIcon } from 'lucide-react';
import { communityQuestions } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnswerSection from '@/components/answer-section';

export default async function QuestionPage({
  params,
}: {
  params: { id: string };
}) {
  const question = communityQuestions.find((q) => q.id === params.id);

  if (!question) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="space-y-4">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
          {question.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            Asked on {format(new Date(question.createdAt), 'MMM d, yyyy')}
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

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[6fr_2fr]">
        <div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>{question.body}</p>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
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

        </div>
        <aside className="space-y-6">
          <div className="rounded-lg bg-primary/5 p-4">
            <h3 className="font-semibold text-primary">Post Your Answer</h3>
            <form className="mt-4 space-y-4">
              <Textarea placeholder="Type your answer here..." className="min-h-[150px]" />
              <Button className="w-full">Submit Answer</Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
