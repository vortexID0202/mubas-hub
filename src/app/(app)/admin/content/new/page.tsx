
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const contentSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  category: z.string({ required_error: 'Please select a category.' }),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  postAsLiveUpdate: z.boolean().default(false),
});

type ContentFormData = z.infer<typeof contentSchema>;

export default function AdminNewContentPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      content: '',
      postAsLiveUpdate: false,
    },
  });
  
  const { formState: { isSubmitting }, watch } = form;
  const isLiveUpdate = watch('postAsLiveUpdate');

  const onSubmit = async (data: ContentFormData) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in as an admin.'});
        return;
    }

    if (data.postAsLiveUpdate) {
        // Post to live_updates collection
        const updateData = {
            title: data.title,
            content: data.content,
            category: 'Announcement', // Live updates have their own categories
            authorId: user.uid,
            createdAt: serverTimestamp(),
        };
        const updatesCollection = collection(firestore, 'live_updates');
        
        addDoc(updatesCollection, updateData)
            .then(() => {
                toast({ title: 'Live Update Published', description: 'The new live update has been published.' });
                router.push('/admin/content');
            })
            .catch(error => {
                if (error.code === 'permission-denied') {
                     toast({
                        variant: 'destructive',
                        title: 'Permission Denied',
                        description: 'You do not have the required admin privileges to publish a live update. Please contact a system administrator.',
                    });
                } else {
                    toast({ variant: 'destructive', title: 'Live Update Failed', description: error.message || 'The live update could not be posted.' });
                }
            });

    } else {
        // Post to knowledge_base_articles collection
        const kbData = {
            title: data.title,
            category: data.category,
            content: data.content,
            authorId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            icon: data.category === 'Wi-Fi' ? 'Wifi' : data.category === 'Fees' ? 'Landmark' : 'BookOpen',
        };
        
        const kbCollection = collection(firestore, 'knowledge_base_articles');
        
        addDoc(kbCollection, kbData)
            .then(() => {
                toast({ title: 'Article Published', description: 'The new article has been added to the knowledge base.'});
                router.push('/admin/content');
            })
            .catch(error => {
                if (error.code === 'permission-denied') {
                    toast({
                        variant: 'destructive',
                        title: 'Permission Denied',
                        description: 'You do not have the required admin privileges to publish an article. Please contact a system administrator.',
                    });
                } else {
                    toast({ variant: 'destructive', title: 'Article Publishing Failed', description: error.message || 'Could not save the new content.' });
                }
            });
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/admin/content" className="text-muted-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Create New Content</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{isLiveUpdate ? 'New Live Update' : 'New Knowledge Base Article'}</CardTitle>
              <CardDescription>
                Fill out the form below to create new content. Use the toggle to switch between a Live Update and a Knowledge Base article.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField
                control={form.control}
                name="postAsLiveUpdate"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 rounded-lg border p-4 w-full bg-muted/40">
                     <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    <div className="grid gap-0.5">
                      <FormLabel className="text-base">
                        Post as Live Update
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        If enabled, this will publish a live update. If disabled, it will create a knowledge base article.
                      </p>
                    </div>
                  </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter content title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!isLiveUpdate && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select an article category" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="Wi-Fi">Wi-Fi</SelectItem>
                           <SelectItem value="SMIS">SMIS</SelectItem>
                           <SelectItem value="Fees">Fees</SelectItem>
                           <SelectItem value="Academics">Academics</SelectItem>
                           <SelectItem value="Library">Library</SelectItem>
                           <SelectItem value="Other">Other</SelectItem>
                         </SelectContent>
                       </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write the full content here..." className="min-h-[300px]" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-6 border-t pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Publishing...</>
                ) : (
                    <><PlusCircle className="mr-2 h-4 w-4" /> Publish Content</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}

    