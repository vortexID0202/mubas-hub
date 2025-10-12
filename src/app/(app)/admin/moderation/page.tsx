'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CommunityQuestion, QuestionAnswer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import ClientOnlyDate from '@/components/client-only-date';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

function AnswerModerationItem({ answer }: { answer: QuestionAnswer }) {
  const firestore = useFirestore();
  const questionRef = useMemoFirebase(() => firestore ? doc(firestore, 'questions', answer.questionId) : null, [firestore, answer.questionId]);
  const { data: question, isLoading, error } = useDoc<CommunityQuestion>(questionRef);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!firestore) return;
    const answerRef = doc(firestore, `questions/${answer.questionId}/answers`, answer.id);
    try {
      await updateDoc(answerRef, { approved: true });
      toast({ title: "Answer approved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Approval failed", description: error.message });
    }
  };

  const handleDelete = async () => {
    if (!firestore) return;
    const answerRef = doc(firestore, `questions/${answer.questionId}/answers`, answer.id);
    try {
      await deleteDoc(answerRef);
      toast({ title: "Answer deleted." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion failed", description: error.message });
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium max-w-sm">
        <p className="truncate">{answer.body}</p>
        {isLoading && <Skeleton className="h-4 w-32 mt-1" />}
        {error && <p className="text-xs text-red-500 mt-1">Error loading question.</p>}
        {question && (
          <Popover>
            <PopoverTrigger asChild>
              <p className="text-xs text-muted-foreground mt-1">
                For question: <span className="underline cursor-pointer">{question.title}</span>
              </p>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{question.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{question.body}</p>
                <div className="text-xs text-muted-foreground">
                  Asked by {question.author.name} on <ClientOnlyDate date={question.createdAt} formatString="P" />
                </div>
                <Link href={`/questions/${question.id}`} className="text-sm text-primary underline" target="_blank" rel="noopener noreferrer">View full question</Link>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {!question && !isLoading && !error && <p className="text-xs text-muted-foreground mt-1">Question not found.</p>}
      </TableCell>
      <TableCell>
        <Badge variant="outline">Answer</Badge>
      </TableCell>
      <TableCell>{answer.author.name}</TableCell>
      <TableCell><ClientOnlyDate date={answer.createdAt} formatString="Pp" /></TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="icon" className="mr-2 h-8 w-8" onClick={handleApprove}>
            <Check className="h-4 w-4 text-green-500" />
            <span className="sr-only">Approve</span>
        </Button>
         <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDelete}>
            <X className="h-4 w-4 text-red-500" />
            <span className="sr-only">Reject</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}


export default function AdminModerationPage() {
  const firestore = useFirestore();
  const answersQuery = useMemoFirebase(
    () => firestore ? query(collectionGroup(firestore, 'answers'), where('approved', '!=', true)) : null,
    [firestore]
  );
  const { data: unapprovedAnswers, isLoading } = useCollection<QuestionAnswer>(answersQuery);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Moderation Queue</h1>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Unapproved Answers</CardTitle>
          <CardDescription>
            Review and approve or delete answers that have not yet been approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
              {!isLoading && unapprovedAnswers?.map((answer) => (
                <AnswerModerationItem key={answer.id} answer={answer} />
              ))}
              {!isLoading && unapprovedAnswers?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center">No unapproved answers.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}