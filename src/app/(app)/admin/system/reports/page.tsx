
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon, FileCheck2, Loader2, Users, ShieldAlert, BarChart, HeartPulse } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type ReportType = 'user_activity' | 'moderation_actions' | 'content_engagement' | 'system_health';

export default function AdminSystemReportsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [reportType, setReportType] = useState<ReportType>('user_activity');
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<UserProfile[] | null>(null);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !reportData) return null;
        
        const fromDate = date?.from ? Timestamp.fromDate(date.from) : null;
        const toDate = date?.to ? Timestamp.fromDate(date.to) : null;

        let q = query(collection(firestore, 'users'));
        if (fromDate) {
            q = query(q, where('createdAt', '>=', fromDate));
        }
        if (toDate) {
            q = query(q, where('createdAt', '<=', toDate));
        }
        return q;

    }, [firestore, date, reportData]); // Depends on reportData to trigger re-query
    
    // This hook is just for fetching, result is handled in generateReport
    const { data: fetchedUsers, isLoading: isLoadingUsers, error } = useCollection<UserProfile>(usersQuery);


    const generateReport = async () => {
        setIsLoading(true);
        setReportData(null); // Clear previous results

        if (reportType !== 'user_activity') {
            toast({
                variant: 'destructive',
                title: 'Not Implemented',
                description: 'This report type is not yet available.',
            });
            setIsLoading(false);
            return;
        }

        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not available.' });
            setIsLoading(false);
            return;
        }

        const fromDate = date?.from ? date.from : null;
        const toDate = date?.to ? date.to : null;

        try {
            let q = query(collection(firestore, 'users'));
             if (fromDate) {
                const startOfDay = new Date(fromDate);
                startOfDay.setHours(0, 0, 0, 0);
                q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
            }
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                q = query(q, where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
            }
            
            const usersSnapshot = await (await import('firebase/firestore')).getDocs(q);
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setReportData(users);
             toast({
                title: 'Report Generated',
                description: `Found ${users.length} users matching your criteria.`,
            });
        } catch (err) {
            console.error("Error generating report: ", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report.' });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <>
      <div className="flex items-center gap-4">
        <Download className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl">System Reports</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate a New Report</CardTitle>
          <CardDescription>
            Select the report type and date range to generate a new report. The results will be displayed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-4 md:col-span-1">
                 <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select report type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="user_activity"><Users className="mr-2 h-4 w-4 inline-block" /> User Activity</SelectItem>
                     <SelectItem value="moderation_actions" disabled><ShieldAlert className="mr-2 h-4 w-4 inline-block" /> Moderation Actions</SelectItem>
                     <SelectItem value="content_engagement" disabled><BarChart className="mr-2 h-4 w-4 inline-block" /> Content Engagement</SelectItem>
                     <SelectItem value="system_health" disabled><HeartPulse className="mr-2 h-4 w-4 inline-block" /> System Health</SelectItem>
                   </SelectContent>
                 </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="truncate">
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                 <Button className="w-full" onClick={generateReport} disabled={isLoading}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                        <><Download className="mr-2 h-4 w-4" /> Generate Report</>
                    )}
                 </Button>
            </div>
            <div className="md:col-span-2">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Report Preview</CardTitle>
                        <CardDescription>
                            {reportData ? `Showing ${reportData.length} results for "User Activity"` : 'Your generated report will appear here.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] sm:h-[400px]">
                        {isLoading ? (
                             <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                             </div>
                        ) : !reportData ? (
                            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                                <div className="text-center">
                                    <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">Select a report type and click Generate.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Reputation</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">No users found for the selected date range.</TableCell>
                                        </TableRow>
                                    ) : (
                                        reportData.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    <div className="font-medium">{user.fullName}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </TableCell>
                                                <TableCell>{user.reputation}</TableCell>
                                                <TableCell>
                                                     <Badge variant={user.status === 'suspended' ? 'destructive' : 'outline'}>
                                                        {user.status || 'active'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        )}
                        </ScrollArea>
                    </CardContent>
                 </Card>
            </div>
        </CardContent>
      </Card>
    </>
  );
}

    