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
import { FileText, Filter } from 'lucide-react';
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

const logData = [
  { time: '10:00', level: 'info', message: 'User logged in', user: 'user1' },
  { time: '10:02', level: 'info', message: 'Viewed page: /dashboard', user: 'user1' },
  { time: '10:05', level: 'warn', message: 'Failed login attempt', ip: '192.168.1.100' },
  { time: '10:15', level: 'error', message: 'Database connection failed', service: 'api' },
  { time: '10:30', level: 'info', message: 'New question posted', user: 'user2' },
  { time: '11:00', level: 'info', message: 'User logged out', user: 'user1' },
];

const chartData = [
  { name: '1h ago', errors: 4, warnings: 24, info: 100 },
  { name: '45m ago', errors: 3, warnings: 13, info: 150 },
  { name: '30m ago', errors: 2, warnings: 8, info: 200 },
  { name: '15m ago', errors: 1, warnings: 15, info: 220 },
  { name: 'Now', errors: 1, warnings: 5, info: 300 },
];

export default function AdminSystemLogsPage() {
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
      <Card>
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
        <CardContent>
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
              {logData.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{log.time}</TableCell>
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
                    {log.user && `user: ${log.user}`}
                    {log.ip && `ip: ${log.ip}`}
                    {log.service && `service: ${log.service}`}
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
