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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Notification } from '@/lib/types';
import { collection, query, orderBy, limit, writeBatch, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const getNotificationDetails = (notification: Notification) => {
    let actionText = '';
    let href = `/questions/${notification.relatedItemId}`;

    switch (notification.type) {
        case 'new_answer':
            actionText = 'posted a new answer to your question';
            href += `#answer-${notification.id}`;
            break;
        case 'question_upvote':
            actionText = 'upvoted your question';
            break;
        case 'answer_approved':
            actionText = 'approved your answer on';
            break;
        case 'question_flagged':
            actionText = 'flagged a question for review';
            break;
        default:
            actionText = 'interacted with';
    }
    return { actionText, href };
};


export default function NotificationsPopover() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => 
    user && firestore 
        ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'), limit(50))
        : null
  , [user, firestore]);
  
  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleMarkAllAsRead = async () => {
    if (!firestore || !user || unreadCount === 0) return;

    const batch = writeBatch(firestore);
    notifications?.forEach(notification => {
        if (!notification.isRead) {
            const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
            batch.update(notifRef, { isRead: true });
        }
    });

    try {
        await batch.commit();
        toast({ title: 'Notifications marked as read.' });
    } catch (error) {
        console.error("Error marking notifications as read: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not mark notifications as read.' });
    }
  };

  const renderNotifications = (notifs: Notification[]) => {
    if (notifs.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground p-8">
                {isLoading ? "Loading..." : "You're all caught up!"}
            </div>
        );
    }

    return notifs.map(notification => {
        const { actionText, href } = getNotificationDetails(notification);
        return (
             <NotificationItem
                key={notification.id}
                id={notification.id}
                userAvatar={notification.actorAvatar}
                userName={notification.actorName}
                action={actionText}
                questionTitle={notification.questionTitle}
                timestamp={notification.createdAt ? formatDistanceToNow(new Date((notification.createdAt as any).seconds * 1000), { addSuffix: true }) : ''}
                isRead={notification.isRead}
                href={href}
             />
        )
    })
  }

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
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
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
                   {renderNotifications(notifications || [])}
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="unread">
             <ScrollArea className="h-96">
                <div className="p-2 space-y-1">
                    {renderNotifications(notifications?.filter(n => !n.isRead) || [])}
                </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
