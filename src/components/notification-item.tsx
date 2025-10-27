
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ThumbsUp, MessageSquare, CheckCircle } from 'lucide-react';

interface NotificationItemProps {
  id: string;
  userAvatar: string;
  userName: string;
  action: string;
  questionTitle: string;
  timestamp: string;
  isRead: boolean;
  href: string;
}

const getIconFromAction = (action: string) => {
    if (action.includes('upvoted')) return <ThumbsUp className="h-4 w-4 text-blue-500" />;
    if (action.includes('answer')) return <MessageSquare className="h-4 w-4 text-green-500" />;
    if (action.includes('verified')) return <CheckCircle className="h-4 w-4 text-purple-500" />;
    return <Bell className="h-4 w-4 text-gray-500" />;
};

export function NotificationItem({
  id,
  userAvatar,
  userName,
  action,
  questionTitle,
  timestamp,
  isRead,
  href,
}: NotificationItemProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted',
          !isRead && 'bg-primary/5'
        )}
      >
        <div className="relative">
             <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
             <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                {getIconFromAction(action)}
            </span>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{userName}</span> {action}{' '}
            <span className="font-semibold">&quot;{questionTitle}&quot;</span>
          </p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
        {!isRead && (
          <div className="h-2.5 w-2.5 self-center rounded-full bg-primary" />
        )}
      </div>
    </Link>
  );
}
