
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeBaseArticle, LiveUpdate } from '@/lib/types';

const contentSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  tags: z.string().refine(value => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    return tags.length > 0 && tags.length <= 10;
  }, 'Please provide 1 to 10 tags, separated by commas.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
});

type ContentFormData = z.infer<typeof contentSchema>;
type ContentItem = (KnowledgeBaseArticle | LiveUpdate) & { type: 'article' | 'update' };

function EditContentPageSkeleton() {
    return (
        <>
         <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-full mt-2" />
            </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-72 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </>
    )
}

export default function AdminEditContentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const id = params.id as string;
  const type = searchParams.get('type') as 'article' | 'update';

  const [isLoading, setIsLoading] = useState(true);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  });
  
  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (!id || !type || !firestore) return;

    const fetchContent = async () => {
        setIsLoading(true);
        const collectionName = type === 'article' ? 'knowledge_base_articles' : 'live_updates';
        const docRef = doc(firestore, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const tags = type === 'article' ? (data as KnowledgeBaseArticle).tagIds?.join(', ') : (data as LiveUpdate).category;
            setContentItem({ ...data, id: docSnap.id, type } as ContentItem);
            form.reset({
                title: data.title,
                content: data.content,
                tags: tags,
            });
        } else {
            toast({ variant: 'destructive', title: 'Not Found', description: 'The requested content could not be found.' });
            router.push('/admin/content');
        }
        setIsLoading(false);
    };

    fetchContent();
  }, [id, type, firestore, router, toast, form]);


  const onSubmit = async (data: ContentFormData) => {
    if (!firestore || !user || !contentItem) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save changes.'});
        return;
    }
    
    const collectionName = contentItem.type === 'article' ? 'knowledge_base_articles' : 'live_updates';
    const docRef = doc(firestore, collectionName, contentItem.id);

    const tags = data.tags.split(',').map(tag => tag.trim());
    const mainCategory = tags.length > 0 ? tags[0] : 'General';
    
    let updateData: any = {
        title: data.title,
        content: data.content,
        updatedAt: serverTimestamp(),
    };

    if (contentItem.type === 'article') {
        updateData.category = mainCategory;
        updateData.tagIds = tags;
        updateData.icon = mainCategory === 'Wi-Fi' ? 'Wifi' : mainCategory === 'Fees' ? 'Landmark' : 'BookOpen';
    } else {
        updateData.category = mainCategory;
    }
    
    try {
        await updateDoc(docRef, updateData);
        toast({ title: 'Content Updated', description: 'Your changes have been saved.' });
        router.push('/admin/content');
    } catch (error) {
        console.error("Error updating document: ", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'There was a problem saving your changes.' });
    }
  };

  if (isLoading) {
    return <EditContentPageSkeleton />;
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/admin/content" className="text-muted-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Edit Content</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Editing &quot;{contentItem?.title}&quot;</CardTitle>
              <CardDescription>
                Modify the details below and click save to apply the changes.
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
                      <Input placeholder="Enter content title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags / Category</FormLabel>
                       <FormControl>
                         <Input placeholder="e.g. Wi-Fi, SMIS, Fees" {...field} />
                       </FormControl>
                       <FormDescription>
                        Add up to 10 tags, separated by commas. The first tag will be the main category.
                       </FormDescription>
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
