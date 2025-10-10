'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { PlusCircle, BookCopy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';


export default function AdminNewContentPage() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/admin/content" className="text-muted-foreground">
            <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Create New Content</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Knowledge Base Article</CardTitle>
          <CardDescription>
            Fill out the form below to create a new article for the knowledge base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter article title" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                 <Select>
                   <SelectTrigger id="category">
                     <SelectValue placeholder="Select a category" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="wifi">Wi-Fi</SelectItem>
                     <SelectItem value="smis">SMIS</SelectItem>
                     <SelectItem value="fees">Fees</SelectItem>
                     <SelectItem value="academics">Academics</SelectItem>
                     <SelectItem value="library">Library</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                   </SelectContent>
                 </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" placeholder="Write the full content of the article here..." className="min-h-[300px]" />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-6 border-t pt-6">
            <div className="flex items-center space-x-3 rounded-lg border p-4 w-full">
              <Switch id="live-update-toggle" />
              <div className="grid gap-0.5">
                <Label htmlFor="live-update-toggle" className="text-base">
                  Post as Live Update
                </Label>
                <p className="text-sm text-muted-foreground">
                  If enabled, this will also publish the article title and a link as a live update for all users.
                </p>
              </div>
            </div>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Publish Content
             </Button>
        </CardFooter>
      </Card>
    </>
  );
}
