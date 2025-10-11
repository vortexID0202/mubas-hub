
'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminRef = useMemoFirebase(
    () => (firestore && user?.uid ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user?.uid]
  );

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminRef);

  const isAdmin = !!adminDoc;
  const isLoading = isUserLoading || isAdminLoading;

  return { isAdmin, isLoading };
}
