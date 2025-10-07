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
import { Shield, ShieldCheck, ShieldAlert as ShieldAlertIcon, PlusCircle, Trash2, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const securityEvents = [
    { id: 'sec-1', severity: 'High', type: 'Failed Login', description: 'Multiple failed login attempts for user: admin', timestamp: '2023-10-27 10:30:15', ip: '198.51.100.2' },
    { id: 'sec-2', severity: 'Medium', type: 'Suspicious API Call', description: 'Unusual access pattern from API key: ...xxxx', timestamp: '2023-10-27 09:15:45', ip: '203.0.113.10' },
    { id: 'sec-3', severity: 'Low', type: 'Content Flagged', description: 'User flagged content for review.', timestamp: '2023-10-27 08:55:02', user: 'user5' },
];

const apiKeys = [
    { id: 'key-1', name: 'Mobile App Key', value: 'sk_live_...a1b2', created: '2023-01-15', lastUsed: '2023-10-27' },
    { id: 'key-2', name: 'Analytics Service Key', value: 'sk_live_...c3d4', created: '2023-05-20', lastUsed: '2023-10-25' },
];


export default function AdminSystemSecurityPage() {
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
                        {securityEvents.map(event => (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <Badge variant={event.severity === 'High' ? 'destructive' : event.severity === 'Medium' ? 'secondary' : 'outline'}>
                                        {event.severity}
                                    </Badge>
                                </TableCell>
                                <TableCell>{event.type}</TableCell>
                                <TableCell className="font-medium">{event.description}</TableCell>
                                <TableCell>{event.timestamp}</TableCell>
                            </TableRow>
                        ))}
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
