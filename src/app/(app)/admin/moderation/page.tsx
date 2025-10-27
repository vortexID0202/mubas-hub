'use client';

import { useState } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, AlertTriangle, Trash2, MoreHorizontal, Flag, ShieldQuestion } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc, collectionGroup, orderBy } from 'firebase/firestore';
import { CommunityQuestion, QuestionAnswer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import ClientOnlyDate from '@/components/client-only-date';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

function AnswerModerationItem({ answer }: { answer: QuestionAnswer }) {
  const firestore = useFirestore();
  const questionRef = useMemoFirebase(() => firestore ? doc(firestore, 'questions', answer.questionId) : null, [firestore, answer.questionId]);
  const { data: question, isLoading } = useDoc<CommunityQuestion>(questionRef);
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
        <Popover>
          <PopoverTrigger asChild>
            <p className="text-xs text-muted-foreground mt-1">
              For question: <span className="underline cursor-pointer">{isLoading ? "Loading..." : question?.title || "Not found"}</span>
            </p>
          </PopoverTrigger>
          {question && (
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{question.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{question.body}</p>
                <div className="text-xs text-muted-foreground">
                  Asked by {question.author?.name || 'Unknown User'} on <ClientOnlyDate date={question.createdAt} formatString="P" />
                </div>
                <Link href={`/questions/${question.id}`} className="text-sm text-primary underline" target="_blank" rel="noopener noreferrer">View full question</Link>
              </div>
            </PopoverContent>
          )}
        </Popover>
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
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [questionToAction, setQuestionToAction] = useState<{id: string, action: 'delete' | 'flag' | 'unflag'} | null>(null);

  const answersQuery = useMemoFirebase(
    () => firestore ? query(collectionGroup(firestore, 'answers'), where('approved', '==', false), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: unapprovedAnswers, isLoading: isLoadingAnswers } = useCollection<QuestionAnswer>(answersQuery);

  const allQuestionsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: allQuestions, isLoading: isLoadingAllQuestions } = useCollection<CommunityQuestion>(allQuestionsQuery);
  
  const flaggedQuestionsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'questions'), where('isFlagged', '==', true)) : null,
    [firestore]
  );
  const { data: flaggedQuestions, isLoading: isLoadingFlagged } = useCollection<CommunityQuestion>(flaggedQuestionsQuery);

  const handleActionClick = (questionId: string, action: 'delete' | 'flag' | 'unflag') => {
    setQuestionToAction({ id: questionId, action });
    if (action === 'delete') {
      setDialogOpen(true);
    } else {
      handleConfirmAction();
    }
  };

  const handleConfirmAction = async () => {
    if (!questionToAction || !firestore) return;

    const { id, action } = questionToAction;

    try {
        if (action === 'delete') {
            await deleteDoc(doc(firestore, 'questions', id));
            toast({ title: 'Question Deleted', description: 'The question has been successfully deleted.' });
        } else if (action === 'flag') {
            await updateDoc(doc(firestore, 'questions', id), { isFlagged: true });
            toast({ title: 'Question Flagged', description: 'The question has been flagged for review.' });
        } else if (action === 'unflag') {
            await updateDoc(doc(firestore, 'questions', id), { isFlagged: false });
            toast({ title: 'Question Unflagged', description: 'The question is no longer flagged.' });
        }
    } catch (error) {
        console.error(`Error performing action '${action}': `, error);
        toast({ variant: 'destructive', title: 'Action Failed', description: 'There was a problem performing the action.' });
    } finally {
        setDialogOpen(false);
        setQuestionToAction(null);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Moderation Center</h1>
      </div>
      <Tabs defaultValue="answers" className="flex-1 flex flex-col">
        <TabsList className="mb-4 grid h-auto w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="answers">
                Pending Approval
                <Badge variant="secondary" className="ml-2">{unapprovedAnswers?.length ?? 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="questions">
                All Questions
              </TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged Content
                <Badge variant="destructive" className="ml-2">{flaggedQuestions?.length ?? 0}</Badge>
              </TabsTrigger>
          </TabsList>

        <TabsContent value="answers" className="flex-1 mt-4">
           <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>
                Review and approve or delete answers that have not yet been approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
             <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAnswers && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
                  {!isLoadingAnswers && unapprovedAnswers?.map((answer) => (
                    <AnswerModerationItem key={answer.id} answer={answer} />
                  ))}
                  {!isLoadingAnswers && unapprovedAnswers?.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">
                       <div className="flex flex-col items-center gap-2">
                        <Check className="h-10 w-10 text-green-500" />
                        <p className="text-lg font-semibold">Queue is clear!</p>
                        <p className="text-muted-foreground">No unapproved answers right now.</p>
                       </div>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="questions" className="flex-1 mt-4">
           <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>All Questions</CardTitle>
              <CardDescription>
                Review and manage all questions posted in the community forum.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
             <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Asked On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoadingAllQuestions && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
                   {!isLoadingAllQuestions && allQuestions?.map((q) => (
                    <TableRow key={q.id}>
                        <TableCell className="font-medium max-w-[200px] sm:max-w-sm truncate">
                           <Link href={`/questions/${q.id}`} className="hover:underline" target="_blank">
                             {q.title}
                           </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{q.author?.name || 'Unknown User'}</TableCell>
                        <TableCell className="hidden md:table-cell"><ClientOnlyDate date={q.createdAt} formatString="P" /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                  >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                      <Link href={`/questions/${q.id}`} target="_blank">View</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleActionClick(q.id, 'flag')}>
                                      <Flag className="mr-2 h-4 w-4" />
                                      Flag Content
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => handleActionClick(q.id, 'delete')} className="text-red-500">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))}
                   {!isLoadingAllQuestions && allQuestions?.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">
                       <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-10 w-10 text-muted-foreground" />
                        <p className="text-lg font-semibold">No questions found.</p>
                       </div>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flagged" className="flex-1 mt-4">
           <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>
                Content marked for administrative review.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
             <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Asked On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingFlagged && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
                  {!isLoadingFlagged && flaggedQuestions?.map((q) => (
                    <TableRow key={q.id}>
                        <TableCell className="font-medium max-w-[200px] sm:max-w-sm truncate">
                           <Link href={`/questions/${q.id}`} className="hover:underline" target="_blank">
                             {q.title}
                           </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{q.author?.name || 'Unknown User'}</TableCell>
                        <TableCell className="hidden md:table-cell"><ClientOnlyDate date={q.createdAt} formatString="P" /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                  >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleActionClick(q.id, 'unflag')}>
                                      <ShieldQuestion className="mr-2 h-4 w-4" />
                                      Resolve & Unflag
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleActionClick(q.id, 'delete')} className="text-red-500">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))}
                  {!isLoadingFlagged && flaggedQuestions?.length === 0 && (
                     <TableRow><TableCell colSpan={4} className="h-24 text-center">
                       <div className="flex flex-col items-center gap-2">
                        <Check className="h-10 w-10 text-green-500" />
                        <p className="text-lg font-semibold">No flagged content!</p>
                       </div>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the question
                    and all its associated answers from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
    </>
  );
}
