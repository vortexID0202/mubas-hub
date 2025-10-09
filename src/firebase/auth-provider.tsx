'use client';

import { useEffect } from 'react';
import { onIdTokenChanged, getIdToken } from 'firebase/auth';
import { useAuth } from '@/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // We no longer need to create a server-side session cookie for this app's architecture.
      // The client SDK handles auth state persistence.
      // If server-side rendering (SSR) with authenticated data was required,
      // we would need a session cookie, but for this client-heavy app, it's not essential.
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return <>{children}</>;
}
