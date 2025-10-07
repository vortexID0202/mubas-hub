'use client';

import {FirebaseProvider, initializeFirebase} from '@/firebase';

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const {app, auth, firestore} = initializeFirebase();
  return (
    <FirebaseProvider value={{app, auth, firestore}}>
      {children}
    </FirebaseProvider>
  );
}
