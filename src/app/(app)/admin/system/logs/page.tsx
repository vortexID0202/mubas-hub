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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Filter, Loader2, ServerCrash } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Log } from '@/lib/types';
import { collection, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import ClientOnlyDate from '@/components/client-only-date';


const chartData = [
  { name: '1h ago', errors: 4, warnings: 24, info: 100 },
  { name: '45m ago', errors: 3, warnings: 13, info: 150 },
  { name: '30m ago', errors: 2, warnings: 8, info: 200 },
  { name: '15m ago', errors: 1, warnings: 15, info: 220 },
  { name: 'Now', errors: 1, warnings: 5, info: 300 },
];

function LogsPageSkeleton() {
    return Array.from({length: 5}).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        </TableRow>
    ))
}

export default function AdminSystemLogsPage() {
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'logs'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: logs, isLoading } = useCollection<Log>(logsQuery);

  return (
    <>
      <div className="flex items-center gap-4">
        <FileText className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl">System Logs</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            A real-time overview of system events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="warnings" stroke="hsl(var(--primary))" />
               <Line type="monotone" dataKey="info" stroke="hsl(var(--muted-foreground))" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Detailed Logs</CardTitle>
          <CardDescription>
            Browse and filter through individual log entries.
          </CardDescription>
           <div className="flex items-center gap-2 pt-4">
             <Select defaultValue="all">
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Filter by level" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Levels</SelectItem>
                 <SelectItem value="info">Info</SelectItem>
                 <SelectItem value="warn">Warning</SelectItem>
                 <SelectItem value="error">Error</SelectItem>
               </SelectContent>
             </Select>
            <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <LogsPageSkeleton />}
              {!isLoading && logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                     <ClientOnlyDate date={log.createdAt} formatString="Pp" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.level === 'error'
                          ? 'destructive'
                          : log.level === 'warn'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.message}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.context?.userId && `user: ${log.context.userId}`}
                    {log.context?.ip && `ip: ${log.context.ip}`}
                    {log.context?.service && `service: ${log.context.service}`}
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && logs?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ServerCrash className="h-10 w-10" />
                            <p className="font-semibold">No logs found</p>
                            <p className="text-sm">The system has not recorded any log entries yet.</p>
                        </div>
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}

    