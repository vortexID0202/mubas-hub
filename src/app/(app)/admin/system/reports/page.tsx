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
import { Download, Calendar as CalendarIcon, FileCheck2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const recentReports = [
    { id: 'rep-1', name: 'Weekly User Activity Report', date: '2023-10-27', format: 'CSV' },
    { id: 'rep-2', name: 'Monthly Moderation Report', date: '2023-10-25', format: 'PDF' },
    { id: 'rep-3', name: 'Quarterly Content Engagement', date: '2023-10-20', format: 'XLSX' },
];

export default function AdminSystemReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      });

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
            Select the report type, date range, and format to generate a new report.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
                 <Select defaultValue="user_activity">
                   <SelectTrigger>
                     <SelectValue placeholder="Select report type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="user_activity">User Activity</SelectItem>
                     <SelectItem value="moderation_actions">Moderation Actions</SelectItem>
                     <SelectItem value="content_engagement">Content Engagement</SelectItem>
                     <SelectItem value="system_health">System Health</SelectItem>
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
                        <span>Pick a date</span>
                      )}
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


                 <Select defaultValue="csv">
                   <SelectTrigger>
                     <SelectValue placeholder="Select format" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="csv">CSV</SelectItem>
                     <SelectItem value="pdf">PDF</SelectItem>
                     <SelectItem value="xlsx">XLSX</SelectItem>
                   </SelectContent>
                 </Select>
                 <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                 </Button>
            </div>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
                <div className="text-center">
                    <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Your generated report will appear here.</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Download reports that were generated recently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentReports.map(report => (
                <li key={report.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">Generated on {format(new Date(report.date), 'PPP')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download {report.format}
                    </Button>
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
