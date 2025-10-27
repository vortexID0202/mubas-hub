
'use client';

import { useMemo, useState } from 'react';
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
import { collection, orderBy, query, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import ClientOnlyDate from '@/components/client-only-date';
import { sub, format } from 'date-fns';


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
  const [levelFilter, setLevelFilter] = useState('all');

  const logsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'logs'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: logs, isLoading } = useCollection<Log>(logsQuery);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (levelFilter === 'all') return logs;
    return logs.filter(log => log.level === levelFilter);
  }, [logs, levelFilter]);


  const chartData = useMemo(() => {
    if (!logs) return [];

    const now = new Date();
    const periods = Array.from({ length: 5 }).map((_, i) => {
      const end = sub(now, { minutes: i * 15 });
      const start = sub(now, { minutes: (i + 1) * 15 });
      const label = i === 0 ? 'Now' : `${(i) * 15}m ago`;
      return { start, end, label, errors: 0, warnings: 0, info: 0 };
    }).reverse();

    logs.forEach(log => {
      const logDate = (log.createdAt as Timestamp)?.toDate();
      if (!logDate) return;

      for (const period of periods) {
        if (logDate >= period.start && logDate < period.end) {
          if (log.level === 'error') period.errors++;
          if (log.level === 'warn') period.warnings++;
          if (log.level === 'info') period.info++;
          break;
        }
      }
    });
    
    return periods.map(({ label, errors, warnings, info }) => ({
        name: label,
        errors,
        warnings,
        info
    }));

  }, [logs]);


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
            A real-time overview of system events over the last hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && <Skeleton className="w-full h-[300px]" />}
            {!isLoading && (
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="errors" name="Errors" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="warnings" name="Warnings" stroke="hsl(var(--primary))" />
                    <Line type="monotone" dataKey="info" name="Info" stroke="hsl(var(--muted-foreground))" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Detailed Logs</CardTitle>
          <CardDescription>
            Browse and filter through individual log entries.
          </CardDescription>
           <div className="flex items-center gap-2 pt-4">
             <Select value={levelFilter} onValueChange={setLevelFilter}>
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
              {!isLoading && filteredLogs.map((log) => (
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
                    {log.context?.userId && `user: ${log.context.userId.substring(0, 8)}...`}
                    {log.context?.ip && ` ip: ${log.context.ip}`}
                    {log.context?.service && ` service: ${log.context.service}`}
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
