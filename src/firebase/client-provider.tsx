'use client';

import { useMemo } from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider {...firebaseServices}>{children}</FirebaseProvider>;
}
