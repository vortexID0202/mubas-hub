
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

// Note: This is now static data. In a real app, this would be fetched from a 'flags' collection in Firestore.
const flaggedContent = [
    {
        id: 'q-1',
        type: 'Question',
        content: 'This is not a serious question, just spam.',
        author: 'Student 1',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'a-1',
        type: 'Answer',
        content: 'This answer is incorrect and misleading.',
        author: 'Student 2',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'c-1',
        type: 'Comment',
        content: 'This comment contains inappropriate language.',
        author: 'Student 3',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    }
]

export default function AdminModerationPage() {

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Moderation Queue</h1>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
          <CardDescription>
            Review and take action on content that has been flagged by the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-sm truncate">{item.content}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" className="mr-2 h-8 w-8">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Approve</span>
                    </Button>
                     <Button variant="outline" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Reject</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
