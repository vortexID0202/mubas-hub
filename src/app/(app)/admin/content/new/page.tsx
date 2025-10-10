'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
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
  
  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: ContentFormData) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in as an admin.'});
        return;
    }

    const kbData = {
        title: data.title,
        category: data.category,
        body: data.content,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        icon: data.category === 'Wi-Fi' ? 'Wifi' : data.category === 'Fees' ? 'Landmark' : 'BookOpen',
    };
    
    try {
        const kbCollection = collection(firestore, 'knowledge_base_articles');
        const docRef = await addDoc(kbCollection, kbData);

        // If successful and postAsLiveUpdate is true, then add the live update
        if (data.postAsLiveUpdate) {
            const updateData = {
                title: data.title,
                content: `A new knowledge base article has been published: "${data.title}"`,
                category: 'Announcement', 
                authorId: user.uid,
                createdAt: serverTimestamp(),
                relatedArticleId: docRef.id,
            };

            try {
                const updatesCollection = collection(firestore, 'live_updates');
                await addDoc(updatesCollection, updateData);
            } catch (liveUpdateError: any) {
                 if (liveUpdateError.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: 'live_updates',
                        operation: 'create',
                        requestResourceData: updateData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                    toast({ variant: 'destructive', title: 'Live Update Failed', description: 'The article was published, but the live update could not be posted. Please try creating it manually.' });
                }
                // We still redirect as the primary action was successful.
                router.push('/admin/content');
                return;
            }
        }
        
        toast({ title: 'Content Published', description: 'The new article has been added to the knowledge base.'});
        router.push('/admin/content');

    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'knowledge_base_articles',
                operation: 'create',
                requestResourceData: kbData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             toast({ variant: 'destructive', title: 'Publishing Failed', description: error.message || 'Could not save the new content.' });
        }
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
              <CardTitle>New Knowledge Base Article</CardTitle>
              <CardDescription>
                Fill out the form below to create a new article for the knowledge base.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select a category" />
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

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write the full content of the article here..." className="min-h-[300px]" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-6 border-t pt-6">
              <FormField
                control={form.control}
                name="postAsLiveUpdate"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 rounded-lg border p-4 w-full">
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
                        If enabled, this will also publish the article title and a link as a live update for all users.
                      </p>
                    </div>
                  </FormItem>
                )}
                />
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
