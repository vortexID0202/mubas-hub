
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
import { Button } from '@/components/ui/button';
import { PlusCircle, File, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ClientOnlyDate from '@/components/client-only-date';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { KnowledgeBaseArticle, LiveUpdate } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


function AdminContentPageSkeletonRow() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell>
                <div className="flex justify-end">
                    <Skeleton className="h-8 w-8" />
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function AdminContentPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, title: string, type: 'articles' | 'updates'} | null>(null);

  const articlesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'knowledge_base_articles'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: articles, isLoading: isLoadingArticles } = useCollection<KnowledgeBaseArticle>(articlesQuery);

  const updatesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'live_updates'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: updates, isLoading: isLoadingUpdates } = useCollection<LiveUpdate>(updatesQuery);

  const handleDeleteClick = (id: string, title: string, type: 'articles' | 'updates') => {
      setItemToDelete({ id, title, type });
      setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !firestore || !user) return;

    const collectionName = itemToDelete.type === 'articles' ? 'knowledge_base_articles' : 'live_updates';
    const logsCollection = collection(firestore, 'logs');

    try {
        await deleteDoc(doc(firestore, collectionName, itemToDelete.id));
        await addDoc(logsCollection, {
            level: 'warn',
            message: `Admin deleted ${itemToDelete.type === 'articles' ? 'article' : 'update'}: "${itemToDelete.title}"`,
            createdAt: serverTimestamp(),
            context: { userId: user.uid, service: 'ContentService' }
        });
        toast({ title: 'Content Deleted', description: 'The item has been successfully deleted.' });
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({ variant: 'destructive', title: 'Deletion Failed', description: 'There was a problem deleting the item.' });
    } finally {
        setDialogOpen(false);
        setItemToDelete(null);
    }
  };


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Content Management</h1>
      </div>
      <Tabs defaultValue="articles" className="flex-1 flex flex-col">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="articles">Knowledge Base</TabsTrigger>
            <TabsTrigger value="updates">Live Updates</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1" asChild>
              <Link href="/admin/content/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New
                </span>
              </Link>
            </Button>
          </div>
        </div>
        <TabsContent value="articles" className="flex-1 mt-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Knowledge Base Articles</CardTitle>
              <CardDescription>
                Manage official articles and guides.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
             <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingArticles && Array.from({length: 3}).map((_, i) => <AdminContentPageSkeletonRow key={i}/>)}
                  {articles?.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <Link href={`/kb/${article.id}`} className="hover:underline">{article.title}</Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <ClientOnlyDate date={article.createdAt} formatString="P" />
                      </TableCell>
                      <TableCell>
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
                                <Link href={`/admin/content/${article.id}/edit?type=article`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDeleteClick(article.id, article.title, 'articles')} className="text-red-600">
                                Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoadingArticles && articles?.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No articles found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="updates" className="flex-1 mt-4">
           <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Live Updates</CardTitle>
              <CardDescription>
                Manage university-wide announcements.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
             <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUpdates && Array.from({length: 3}).map((_, i) => <AdminContentPageSkeletonRow key={i}/>)}
                  {updates?.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell className="font-medium">
                        {update.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                         <Badge
                            variant={
                              update.category === 'Maintenance'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {update.category}
                          </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <ClientOnlyDate date={update.createdAt} formatString="P" />
                      </TableCell>
                      <TableCell>
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
                                <Link href={`/admin/content/${update.id}/edit?type=update`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDeleteClick(update.id, update.title, 'updates')} className="text-red-600">
                                Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                   {!isLoadingUpdates && updates?.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No live updates found.
                        </TableCell>
                    </TableRow>
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
                    This action cannot be undone. This will permanently delete the content
                    from the database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
    </>
  );
}
