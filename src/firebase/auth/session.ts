'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';

/**
 * This component listens for changes in the user's authentication state.
 * When a user logs in, it sends their ID token to a server-side API route
 * to create a session cookie. When they log out, it calls the same route
 * to clear the cookie. This keeps the server's session state in sync
 * with the client-side auth state.
 */
export function SessionManager() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
        if (user) {
            const idToken = await user.getIdToken();
            // User is signed in, create or update the session cookie
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });
        } else {
            // User is signed out, clear the session cookie
            await fetch('/api/auth/session', {
                method: 'DELETE',
            });
        }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return null; // This component does not render anything.
}
