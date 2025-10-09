'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    // This listener is the key to synchronizing auth state.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // User is signed in. Get the ID token and send it to the server to create/update the session cookie.
        const idToken = await user.getIdToken();
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error('Failed to create session cookie:', error);
        }
      } else {
        // User is signed out. Send a request to the server to clear the session cookie.
        try {
          await fetch('/api/auth/session', {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to clear session cookie:', error);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Dependency array ensures this effect runs only when the auth instance changes.

  return <>{children}</>;
}
