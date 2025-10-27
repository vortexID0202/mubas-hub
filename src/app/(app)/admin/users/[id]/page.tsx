
'use client';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileDetails } from '@/components/user-profile-details';
import Link from 'next/link';

function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <UserProfileDetails userProfile={null} isLoading={true} />
    </div>
  );
}

export default function AdminViewUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'users', id) : null),
    [firestore, id]
  );
  const {
    data: userProfile,
    isLoading,
    error,
  } = useDoc<UserProfile>(userProfileRef);

  if (error) {
    console.error('Error fetching user profile:', error);
    // You could redirect or show a dedicated error component
    return <div>Error loading user profile.</div>;
  }

  return (
    <div className="space-y-6">
       <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
       >
        <ChevronLeft className="h-4 w-4" />
        Back to User Management
       </Link>

      {isLoading || !userProfile ? (
        <UserProfileSkeleton />
      ) : (
        <UserProfileDetails userProfile={userProfile} isLoading={false} />
      )}
    </div>
  );
}
