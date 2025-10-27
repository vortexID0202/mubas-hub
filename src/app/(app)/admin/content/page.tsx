
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, File, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ClientOnlyDate from '@/components/client-only-date';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { KnowledgeBaseArticle, LiveUpdate } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


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

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Content Management</h1>
      </div>
      <Tabs defaultValue="articles">
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
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Articles</CardTitle>
              <CardDescription>
                Manage official articles and guides.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created At</TableHead>
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
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="updates">
           <Card>
            <CardHeader>
              <CardTitle>Live Updates</CardTitle>
              <CardDescription>
                Manage university-wide announcements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created At</TableHead>
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
                      <TableCell>
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
                      <TableCell>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
