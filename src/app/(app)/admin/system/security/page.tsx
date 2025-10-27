
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ShieldAlert as ShieldAlertIcon, PlusCircle, Trash2, KeyRound, ServerCrash } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Log } from '@/lib/types';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import ClientOnlyDate from '@/components/client-only-date';
import { Skeleton } from '@/components/ui/skeleton';


const apiKeys = [
    { id: 'key-1', name: 'Mobile App Key', value: 'sk_live_...a1b2', created: '2023-01-15', lastUsed: '2023-10-27' },
    { id: 'key-2', name: 'Analytics Service Key', value: 'sk_live_...c3d4', created: '2023-05-20', lastUsed: '2023-10-25' },
];

function SecurityEventsSkeleton() {
    return Array.from({length: 3}).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        </TableRow>
    ));
}


export default function AdminSystemSecurityPage() {
  const firestore = useFirestore();
  const logsQuery = useMemoFirebase(
    () => firestore ? query(
        collection(firestore, 'logs'), 
        orderBy('createdAt', 'desc'), 
        limit(50) // Fetch more logs to filter on the client
    ) : null,
    [firestore]
  );
  const { data: logs, isLoading } = useCollection<Log>(logsQuery);

  const securityEvents = useMemo(() => {
    if (!logs) return [];
    
    // Filter for warnings and errors on the client side
    const filtered = logs.filter(log => log.level === 'warn' || log.level === 'error');

    return filtered.slice(0, 10).map(log => {
      let type = 'System';
      if (log.message.toLowerCase().includes('login')) type = 'Authentication';
      if (log.message.toLowerCase().includes('delete')) type = 'Data Modification';
      if (log.message.toLowerCase().includes('permission')) type = 'Security Rule';

      return {
        id: log.id,
        severity: log.level === 'error' ? 'High' : 'Medium',
        type: type,
        description: log.message,
        timestamp: log.createdAt,
        context: log.context,
      };
    });
  }, [logs]);


  return (
    <>
      <div className="flex items-center gap-4">
        <Shield className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl">Security Center</h1>
      </div>
        <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-500">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>System Status: Secure</AlertTitle>
            <AlertDescription>
                No critical security vulnerabilities detected. All systems are operating normally.
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>A log of notable security-related events in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Severity</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <SecurityEventsSkeleton />}
                        {!isLoading && securityEvents.map(event => (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <Badge variant={event.severity === 'High' ? 'destructive' : event.severity === 'Medium' ? 'secondary' : 'outline'}>
                                        {event.severity}
                                    </Badge>
                                </TableCell>
                                <TableCell>{event.type}</TableCell>
                                <TableCell className="font-medium">{event.description}</TableCell>
                                <TableCell>
                                    <ClientOnlyDate date={event.timestamp} formatString="Pp" />
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && securityEvents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ShieldCheck className="h-10 w-10" />
                                        <p className="font-semibold">No security events found</p>
                                        <p className="text-sm">The system has not recorded any warnings or errors recently.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Manage API keys for external services and integrations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apiKeys.map(key => (
                            <TableRow key={key.id}>
                                <TableCell className="font-medium">{key.name}</TableCell>
                                <TableCell className="font-mono text-xs">{key.value}</TableCell>
                                <TableCell>{key.created}</TableCell>
                                <TableCell>{key.lastUsed}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                        <span className="sr-only">Revoke Key</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardContent className="border-t pt-6">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generate New API Key
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure system-wide security parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="two-factor-auth" className="font-semibold">Two-Factor Authentication (2FA)</Label>
                        <p className="text-sm text-muted-foreground">
                            Require 2FA for all administrator accounts.
                        </p>
                    </div>
                    <Switch id="two-factor-auth" defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="rate-limiting" className="font-semibold">API Rate Limiting</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable to prevent abuse of the public API.
                        </p>
                    </div>
                    <Switch id="rate-limiting" defaultChecked />
                </div>
            </CardContent>
        </Card>

    </>
  );
}
