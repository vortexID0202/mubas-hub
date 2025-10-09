'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';

async function setSessionCookie(idToken: string | null) {
  if (idToken) {
    await fetch('/api/auth/login', {
      method: 'POST',
      body: idToken,
    });
  } else {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  }
}

export function SessionManager() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
        const idToken = user ? await user.getIdToken() : null;
        await setSessionCookie(idToken);
    });

    return () => unsubscribe();
  }, [auth]);

  return null; // This component does not render anything.
}
