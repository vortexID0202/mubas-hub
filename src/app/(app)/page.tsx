
'use client';
import Link from 'next/link';
import {
  BookOpen,
  Frown,
  Medal,
  MessageSquare,
  Trophy,
  Users,
  Rss,
  ChevronRight,
  Filter,
  Megaphone,
  Pencil,
  BarChart,
  PlusSquare,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ArticleCard from '@/components/article-card';
import QuestionCard from '@/components/question-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { CommunityQuestion, KnowledgeBaseArticle, LiveUpdate, UserProfile } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import ClientOnlyDate from '@/components/client-only-date';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const { user } = useUser();
  const isAdmin = user?.email === 'dante@gmail.com';
  const firestore = useFirestore();
  
  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('createdAt', 'desc'), limit(3)) : null
  , [firestore]);
  const { data: communityQuestions, isLoading: isLoadingQuestions } = useCollection<CommunityQuestion>(questionsQuery);

  const articlesQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'knowledge_base_articles'), orderBy('createdAt', 'desc'), limit(3)) : null
  , [firestore]);
  const { data: knowledgeBaseArticles, isLoading: isLoadingArticles } = useCollection<KnowledgeBaseArticle>(articlesQuery);

  const liveUpdatesQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'live_updates'), orderBy('createdAt', 'desc'), limit(5)) : null
  , [firestore]);
  const { data: liveUpdates, isLoading: isLoadingUpdates } = useCollection<LiveUpdate>(liveUpdatesQuery);

  const usersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), orderBy('reputation', 'desc')) : null
  , [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const nonAdminUsers = allUsers?.filter(u => u.email !== 'dante@gmail.com') ?? [];
  const topThree = nonAdminUsers.slice(0, 3);
  const restUsers = nonAdminUsers.slice(3, 10);


  const browseItems = [
    {
      title: 'Community Forum',
      description: 'Ask questions and get help from your peers.',
      href: '/forum',
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      title: 'Knowledge Base',
      description: 'Find official guides and verified information.',
      href: '/kb',
      icon: BookOpen,
      adminOnly: false,
    },
    {
      title: 'Ask a Question',
      description: 'Post your own question to the community.',
      href: '/ask',
      icon: Pencil,
      adminOnly: false,
      hideForAdmin: true,
    },
     {
      title: 'Post Content',
      description: 'Create a new knowledge base article or live update.',
      href: '/admin/content/new',
      icon: PlusSquare,
      adminOnly: true,
    },
    {
      title: 'Live Updates',
      description: 'Latest announcements from the administration.',
      href: '/updates',
      icon: Megaphone,
      adminOnly: false,
    },
    {
      title: 'Top Contributors',
      description: 'See the most helpful members of the community.',
      href: '#contributors',
      icon: BarChart,
      adminOnly: false,
    },
  ];

  const visibleBrowseItems = browseItems.filter(item => {
    if (isAdmin) {
      return !item.hideForAdmin;
    }
    return !item.adminOnly;
  });


  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="flex w-full flex-col">
          <section
            className="relative w-full bg-cover bg-center py-16 text-white md:py-24 lg:py-32"
            style={{ backgroundImage: "url('/slide5.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/35" />
            <div className="container relative px-4 md:px-6">
              <div className="mx-auto grid max-w-3xl items-center justify-center gap-4 text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Welcome to the MUBAS Community Hub
                </h1>
                <p className="text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Search for solutions, articles, or ask a question to the
                  community. We are here to help you succeed.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-16 lg:py-20">
            <div className="container px-4 md:px-6">
              <div className="space-y-2 text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter">
                  Browse
                </h2>
                <p className="text-muted-foreground">
                  Quickly navigate to what you need.
                </p>
              </div>
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="mx-auto mt-10 w-full max-w-sm md:max-w-xl lg:max-w-4xl"
              >
                <CarouselContent>
                  {visibleBrowseItems.map((item, index) => (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <Link href={item.href}>
                          <Card className="flex h-48 flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:shadow-lg">
                            <item.icon className="h-10 w-10 text-primary" />
                            <CardTitle className="mt-4 text-xl">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {item.description}
                            </CardDescription>
                          </Card>
                        </Link>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            </div>
          </section>

          <section
            className="w-full bg-muted/20 py-12 md:py-16 lg:py-20"
            id="forum"
          >
            <div className="container px-4 md:px-6">
              <Tabs defaultValue="forum" className="w-full">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <TabsList className="grid w-full grid-cols-3 md:w-auto">
                    <TabsTrigger value="forum">
                      <MessageSquare className="mr-2 h-4 w-4" /> Community Forum
                    </TabsTrigger>
                    <TabsTrigger value="knowledge">
                      <BookOpen className="mr-2 h-4 w-4" /> Knowledge Base
                    </TabsTrigger>
                    <TabsTrigger value="contributors">
                      <Users className="mr-2 h-4 w-4" /> Top Contributors
                    </TabsTrigger>
                  </TabsList>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Recently Uploaded</DropdownMenuItem>
                      <DropdownMenuItem>Popular Questions</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <TabsContent value="forum" className="mt-8">
                  {isLoadingQuestions && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-96" />)}
                    </div>
                  )}
                  {communityQuestions && communityQuestions.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {communityQuestions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                    </div>
                  ) : (
                    !isLoadingQuestions && (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <Frown className="h-16 w-16 text-muted-foreground" />
                      <h2 className="mt-6 text-xl font-semibold">
                        No Questions Yet
                      </h2>
                      <p className="mt-2 text-center text-muted-foreground">
                        Be the first to ask a question and get help from the
                        community.
                      </p>
                      <Button asChild className="mt-6">
                        <Link href="/ask">Ask a Question</Link>
                      </Button>
                    </div>
                    )
                  )}
                  <div className="mt-8 text-center">
                    <Button variant="link" asChild>
                      <Link href="/forum">
                        View all questions{' '}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge" className="mt-8" id="knowledge">
                   {isLoadingArticles && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-80" />)}
                    </div>
                  )}
                  {knowledgeBaseArticles && knowledgeBaseArticles.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {knowledgeBaseArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                   ) : (
                     !isLoadingArticles && (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                            <BookOpen className="h-16 w-16 text-muted-foreground" />
                            <h2 className="mt-6 text-xl font-semibold">No Articles Yet</h2>
                            <p className="mt-2 text-center text-muted-foreground">
                                The knowledge base is empty. Admin can post new articles.
                            </p>
                        </div>
                     )
                   )}
                  <div className="mt-8 text-center">
                    <Button variant="link" asChild>
                      <Link href="/kb">
                        View all articles{' '}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="contributors"
                  className="mt-8"
                  id="contributors"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Contributors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsers && (
                        <div>
                          <div className="mb-8 flex items-end justify-center gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <Skeleton className="h-24 w-24 rounded-full" />
                          </div>
                          <ul className="space-y-2">
                             {Array.from({ length: 7 }).map((_, i) => (
                                <li key={i} className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                                  <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-5 w-32" />
                                  </div>
                                  <Skeleton className="h-5 w-16" />
                                </li>
                             ))}
                          </ul>
                        </div>
                      )}
                      {!isLoadingUsers && nonAdminUsers && nonAdminUsers.length > 0 && (
                        <>
                          <div className="mb-8 flex items-end justify-center gap-4">
                            {topThree[1] && (
                              <div className="flex flex-col items-center text-center">
                                <Avatar className="h-20 w-20 border-4 border-slate-300">
                                  <AvatarImage src={topThree[1].avatarUrl} />
                                  <AvatarFallback>
                                    {topThree[1].fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <Medal className="mt-2 h-8 w-8 text-slate-400" />
                                <p className="font-semibold">{topThree[1].fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {topThree[1].reputation} points
                                </p>
                              </div>
                            )}
                            {topThree[0] && (
                              <div className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 border-4 border-amber-400">
                                  <AvatarImage src={topThree[0].avatarUrl} />
                                  <AvatarFallback>
                                    {topThree[0].fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <Trophy className="mt-2 h-10 w-10 text-amber-400" />
                                <p className="text-lg font-bold">
                                  {topThree[0].fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {topThree[0].reputation} points
                                </p>
                              </div>
                            )}
                            {topThree[2] && (
                              <div className="flex flex-col items-center text-center">
                                <Avatar className="h-20 w-20 border-4 border-amber-800">
                                  <AvatarImage src={topThree[2].avatarUrl} />
                                  <AvatarFallback>
                                    {topThree[2].fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <Medal className="mt-2 h-8 w-8 text-amber-800" />
                                <p className="font-semibold">{topThree[2].fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {topThree[2].reputation} points
                                </p>
                              </div>
                            )}
                          </div>

                          <ul className="space-y-2">
                            {restUsers.map((user, index) => (
                              <li
                                key={user.id}
                                className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-lg font-bold text-muted-foreground">
                                    {index + 4}
                                  </span>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback>
                                      {user.fullName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{user.fullName}</p>
                                  </div>
                                </div>
                                <p className="font-mono text-lg font-semibold text-primary">
                                  {user.reputation}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {!isLoadingUsers && (!nonAdminUsers || nonAdminUsers.length === 0) && (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                          <Users className="h-16 w-16 text-muted-foreground" />
                          <h2 className="mt-6 text-xl font-semibold">No Users Found</h2>
                          <p className="mt-2 text-center text-muted-foreground">
                              There are no users in the system yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          <section className="w-full bg-muted/50 py-12 md:py-16 lg:py-20">
            <div className="container px-4 md:px-6">
              <div className="text-center">
                <h2 className="flex items-center justify-center gap-2 font-headline text-2xl font-bold tracking-tighter sm:text-3xl">
                  <Rss className="h-7 w-7 text-primary" /> Live Updates
                </h2>
                <CardDescription className="mx-auto mt-2 max-w-md">
                  Stay informed with the latest announcements and changes from
                  the university administration.
                </CardDescription>
              </div>

              <div className="mt-8 grid gap-6">
                {isLoadingUpdates && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
                )}
                {liveUpdates && liveUpdates.length > 0 ? (
                  liveUpdates.map((update) => (
                    <Card key={update.id}>
                      <CardHeader>
                        <CardTitle>{update.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <Badge
                            variant={
                              update.category === 'Maintenance' ? 'destructive'
                              : update.category === 'Academics' ? 'default'
                              : 'secondary'
                            }
                          >
                            {update.category}
                          </Badge>
                          <ClientOnlyDate date={update.createdAt} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{update.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  !isLoadingUpdates && (
                     <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Rss className="h-16 w-16 text-muted-foreground" />
                        <h2 className="mt-6 text-xl font-semibold">No Live Updates Yet</h2>
                        <p className="mt-2 text-center text-muted-foreground">
                           Check back later for the latest announcements.
                        </p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 text-center">
                <Button variant="link" asChild>
                  <Link href="/updates">
                    View all updates <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
