
'use client';
import { Bell, CheckCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from './notification-item';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

// Placeholder notifications
const placeholderNotifications = [
  {
    id: '1',
    userAvatar: '/avatars/01.png',
    userName: 'John Doe',
    action: 'posted a new answer to your question',
    questionTitle: 'How to setup WiFi?',
    timestamp: '5m ago',
    isRead: false,
    href: '/questions/1',
  },
  {
    id: '2',
    userAvatar: '/avatars/02.png',
    userName: 'Jane Smith',
    action: 'upvoted your answer on',
    questionTitle: 'Library opening hours',
    timestamp: '1h ago',
    isRead: false,
    href: '/questions/2',
  },
  {
    id: '3',
    userAvatar: '/avatars/03.png',
    userName: 'Admin',
    action: 'verified your answer on',
    questionTitle: 'SMIS Password Reset',
    timestamp: '3h ago',
    isRead: true,
    href: '/questions/3',
  },
];

export default function NotificationsPopover() {
  const unreadCount = placeholderNotifications.filter(n => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
             <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {unreadCount}
             </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm">
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
            </Button>
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ScrollArea className="h-96">
                <div className="p-2 space-y-1">
                    {placeholderNotifications.map(notification => (
                        <NotificationItem key={notification.id} {...notification} />
                    ))}
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="unread">
             <ScrollArea className="h-96">
                <div className="p-2 space-y-1">
                    {placeholderNotifications.filter(n => !n.isRead).map(notification => (
                        <NotificationItem key={notification.id} {...notification} />
                    ))}
                     {placeholderNotifications.filter(n => !n.isRead).length === 0 && (
                        <div className="text-center text-sm text-muted-foreground p-8">
                            You&apos;re all caught up!
                        </div>
                    )}
                </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="p-2 border-t text-center">
            <Link href="/notifications" className="text-sm text-primary hover:underline">
                View all notifications
            </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
