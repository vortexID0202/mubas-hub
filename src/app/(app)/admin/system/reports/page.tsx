
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
import { useFirestore } from '@/firebase';
import { UserProfile, Log, CommunityQuestion, QuestionAnswer, KnowledgeBaseArticle } from '@/lib/types';
import { collection, query, where, Timestamp, getDocs, orderBy, limit } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type ReportType = 'user_activity' | 'moderation_actions' | 'content_engagement' | 'system_health';
type ReportData = UserProfile[] | Log[] | (CommunityQuestion | KnowledgeBaseArticle)[] | (CommunityQuestion | QuestionAnswer)[];

export default function AdminSystemReportsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [reportType, setReportType] = useState<ReportType>('user_activity');
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const generateReport = async () => {
        setIsLoading(true);
        setReportData(null);

        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not available.' });
            setIsLoading(false);
            return;
        }

        const fromDate = date?.from ? Timestamp.fromDate(date.from) : null;
        const toDate = date?.to ? Timestamp.fromDate(date.to) : null;

        try {
            let fetchedData: any[] = [];
            let baseQuery;

            switch (reportType) {
                case 'user_activity':
                    baseQuery = query(collection(firestore, 'users'));
                    if (fromDate) baseQuery = query(baseQuery, where('createdAt', '>=', fromDate));
                    if (toDate) baseQuery = query(baseQuery, where('createdAt', '<=', toDate));
                    const usersSnapshot = await getDocs(baseQuery);
                    fetchedData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                    break;
                
                case 'moderation_actions':
                    const flaggedQuestionsQuery = query(collection(firestore, 'questions'), where('isFlagged', '==', true));
                    const flaggedQuestionsSnap = await getDocs(flaggedQuestionsQuery);
                    const flaggedQuestions = flaggedQuestionsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'question' } as CommunityQuestion & {type: 'question'}));
                    
                    // Note: collectionGroup queries can't be combined with date filters easily
                    const unapprovedAnswersQuery = query(collection(firestore, 'answers'), where('approved', '==', false));
                    const unapprovedAnswersSnap = await getDocs(unapprovedAnswersQuery);
                    const unapprovedAnswers = unapprovedAnswersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'answer' } as QuestionAnswer & {type: 'answer'}));

                    fetchedData = [...flaggedQuestions, ...unapprovedAnswers];
                    break;
                
                case 'content_engagement':
                    const topQuestionsQuery = query(collection(firestore, 'questions'), orderBy('votes', 'desc'), limit(10));
                    const topQuestionsSnap = await getDocs(topQuestionsQuery);
                    const topQuestions = topQuestionsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as CommunityQuestion));
                    
                    const topArticlesQuery = query(collection(firestore, 'knowledge_base_articles'), orderBy('views', 'desc'), limit(10));
                    const topArticlesSnap = await getDocs(topArticlesQuery); // Assuming 'views' field exists
                    const topArticles = topArticlesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as KnowledgeBaseArticle));

                    fetchedData = [...topQuestions, ...topArticles];
                    break;
                
                case 'system_health':
                    baseQuery = query(collection(firestore, 'logs'), where('level', 'in', ['error', 'warn']));
                    if (fromDate) baseQuery = query(baseQuery, where('createdAt', '>=', fromDate));
                    if (toDate) baseQuery = query(baseQuery, where('createdAt', '<=', toDate));
                    baseQuery = query(baseQuery, orderBy('createdAt', 'desc'));
                    const logsSnapshot = await getDocs(baseQuery);
                    fetchedData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
                    break;
            }
            
            setReportData(fetchedData);
            toast({
                title: 'Report Generated',
                description: `Found ${fetchedData.length} records matching your criteria.`,
            });
        } catch (err: any) {
            console.error("Error generating report: ", err);
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to generate report.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderReportPreview = () => {
        if (isLoading) {
             return (
                 <div className="flex items-center justify-center h-full min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            );
        }
        
        if (!reportData) {
            return (
                <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                    <div className="text-center">
                        <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Select a report type and click Generate.</p>
                    </div>
                </div>
            );
        }

        if (reportData.length === 0) {
            return <p className="text-center text-muted-foreground">No data found for the selected criteria.</p>;
        }

        switch (reportType) {
            case 'user_activity':
                return (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[250px]">User</TableHead>
                                    <TableHead>Reputation</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(reportData as UserProfile[]).map(user => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'moderation_actions':
                 return (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Link</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {(reportData as any[]).map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{item.title || item.body}</TableCell>
                                        <TableCell><Badge variant="secondary">{item.type}</Badge></TableCell>
                                        <TableCell>{item.type === 'question' ? 'Flagged by user' : 'Pending approval'}</TableCell>
                                        <TableCell><Link href={item.type === 'question' ? `/questions/${item.id}`: `/questions/${item.questionId}`} className="text-primary underline">View</Link></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'content_engagement':
                 return (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Votes/Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(reportData as any[]).map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{item.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.body ? 'secondary' : 'outline'}>
                                                {item.body ? 'Question' : 'Article'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.votes ?? item.views ?? 0}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'system_health':
                return (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(reportData as Log[]).map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>{log.level}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{log.message}</TableCell>
                                        <TableCell>{format(new Date((log.createdAt as Timestamp).seconds * 1000), 'Pp')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                );
            default:
                 return <p>This report type is not yet implemented.</p>;
        }
    }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Download className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl">System Reports</h1>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Generate a New Report</CardTitle>
          <CardDescription>
            Select the report type and date range to generate a new report.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
                 <div className="grid gap-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                        <SelectTrigger className="w-full md:w-[240px]">
                            <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user_activity"><Users className="mr-2 h-4 w-4 inline-block" /> User Activity</SelectItem>
                            <SelectItem value="moderation_actions"><ShieldAlert className="mr-2 h-4 w-4 inline-block" /> Moderation Actions</SelectItem>
                            <SelectItem value="content_engagement"><BarChart className="mr-2 h-4 w-4 inline-block" /> Content Engagement</SelectItem>
                            <SelectItem value="system_health"><HeartPulse className="mr-2 h-4 w-4 inline-block" /> System Health</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                <div className="grid gap-2">
                 <label className="text-sm font-medium">Date Range</label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                            'w-full md:w-[300px] justify-start text-left font-normal',
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
                </div>

                 <Button className="w-full md:w-auto" onClick={generateReport} disabled={isLoading}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                        <><Download className="mr-2 h-4 w-4" /> Generate</>
                    )}
                 </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
                {reportData ? `Showing ${reportData.length} results` : 'Your generated report will appear here.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {renderReportPreview()}
        </CardContent>
      </Card>
    </div>
  );
}
