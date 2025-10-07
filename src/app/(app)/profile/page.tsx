'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { CommunityQuestion, UserProfile } from '@/lib/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuestionCard from '@/components/question-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, doc } from 'firebase/firestore';

function ProfilePageSkeleton() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto max-w-6xl py-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                  <Skeleton className="h-8 w-1/3 mt-4" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-3">
               <Skeleton className="h-10 w-48 mb-4" />
               <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const userQuestionsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'questions');
  }, [firestore, user?.uid]);
  
  const { data: userQuestions, isLoading: areQuestionsLoading } = useCollection<CommunityQuestion>(userQuestionsQuery);
  
  // In a real app, you would fetch this from a subcollection or aggregate
  const [userAnswersCount, setUserAnswersCount] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isProfileLoading || areQuestionsLoading;
  
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!userProfile) {
    return (
        <>
        <Header />
        <main className="flex-1 bg-muted/20">
          <div className="container mx-auto max-w-6xl py-12 flex items-center justify-center">
            <p>User not found. Please try logging in again.</p>
          </div>
        </main>
        <Footer />
        </>
    )
  }


  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto max-w-6xl py-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="flex flex-col items-center p-6">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.fullName} />
                            <AvatarFallback className="text-4xl">
                            {userProfile.fullName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background">
                            <Pen className="h-4 w-4"/>
                            <span className="sr-only">Change Profile Picture</span>
                        </Button>
                    </div>
                  <h1 className="mt-4 text-center font-headline text-2xl font-bold">{userProfile.fullName}</h1>
                  <p className="mt-1 text-center text-muted-foreground">
                    {userProfile.email}
                  </p>
                  <div className="mt-4 w-full text-center">
                     <p className="font-bold text-lg text-primary">{userProfile.reputation} <span className="text-sm font-normal text-muted-foreground">Reputation</span></p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
                      <div>
                          <p className="font-bold text-lg">{userQuestions?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                      <div>
                          <p className="font-bold text-lg">{userAnswersCount}</p>
                          <p className="text-xs text-muted-foreground">Answers</p>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <Tabs defaultValue="settings">
                <TabsList className="mb-4">
                  <TabsTrigger value="questions">My Questions</TabsTrigger>
                  <TabsTrigger value="answers">My Answers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Questions you've asked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userQuestions && userQuestions.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {userQuestions.map((q) => (
                            <QuestionCard key={q.id} question={q} />
                          ))}
                        </div>
                      ) : (
                        <p>You haven't asked any questions yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="answers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Answers you've provided</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You haven't answered any questions yet.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>Manage your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={userProfile.fullName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={userProfile.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input id="avatarUrl" defaultValue={user_profile.avatarUrl} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Profile</Button>
                    </CardFooter>
                  </Card>

                   <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password. It is recommended to use a strong, unique password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Update Password</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
