'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { CommunityQuestion, UserProfile } from '@/lib/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { collection, doc, updateDoc } from 'firebase/firestore';
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  avatarUrl: z.string().url('Invalid URL format').or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);

  const userQuestionsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'questions');
  }, [firestore, user?.uid]);
  
  const { data: userQuestions, isLoading: areQuestionsLoading } = useCollection<CommunityQuestion>(userQuestionsQuery);
  
  const [userAnswersCount, setUserAnswersCount] = useState(0);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      avatarUrl: '',
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl,
      });
    }
  }, [userProfile, profileForm]);

  const handleProfileUpdate: SubmitHandler<z.infer<typeof profileSchema>> = async (data) => {
    if (!user || !firestore) return;

    try {
      // Update Auth profile
      await updateProfile(user, {
        displayName: data.fullName,
        photoURL: data.avatarUrl,
      });

      // Update Firestore document
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
    }
  };
  
  const handlePasswordChange: SubmitHandler<z.infer<typeof passwordSchema>> = async (data) => {
    if (!user || !user.email) return;

    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, data.newPassword);
        toast({
            title: 'Password Updated',
            description: 'Your password has been changed successfully.',
        });
        passwordForm.reset();
    } catch (error) {
        console.error('Password change error:', error);
        toast({
            variant: 'destructive',
            title: 'Password Change Failed',
            description: 'Could not update your password. Please check your current password and try again.',
        });
    }
  };

  const isLoading = isUserLoading || isProfileLoading || areQuestionsLoading;
  
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }
  
  if (!user) {
    return <ProfilePageSkeleton />;
  }

  if (profileError || (!isProfileLoading && !userProfile)) {
    return (
        <>
        <Header />
        <main className="flex-1 bg-muted/20">
          <div className="container mx-auto max-w-6xl py-12 flex items-center justify-center">
            <Card className="p-8 text-center">
              <CardTitle className="text-2xl">User Not Found</CardTitle>
              <CardDescription className="mt-2">
                We couldn't find a profile for your account. It's possible it wasn't created correctly.
              </CardDescription>
              <Button onClick={() => router.push('/login')} className="mt-6">
                Try Logging In Again
              </Button>
            </Card>
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
                 <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your public profile information.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={profileForm.control}
                          name="avatarUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avatar URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={userProfile.email} disabled />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                          {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                 </Form>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password. It is recommended to use a strong, unique password.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                            {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
                        </Button>
                      </CardFooter>
                    </Card>
                   </form>
                  </Form>
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

    