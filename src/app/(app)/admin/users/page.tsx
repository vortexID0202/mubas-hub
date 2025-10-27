
'use client';

import { MoreHorizontal, Loader2 } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useUser();

  const usersQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), orderBy('reputation', 'desc')) : null,
    [firestore]
  );
  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = users?.filter(user => user.email !== 'dante@gmail.com');
  const isLoading = areUsersLoading || isCurrentUserLoading;

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">User Management</h1>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage all registered users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Reputation</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredUsers && filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                          <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.reputation}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredUsers?.length || 0}</strong> of <strong>{filteredUsers?.length || 0}</strong> users
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
